let vm = new Vue({
	el: '#app',
	data: {
		store: store,
		loading: true,
		withShadow: false,
		isAdding: false,
		macyInstances: [],
		categoryWatchers: [],
		form: {
			title: '',
			description: '',
		},
	},
	methods: {
		toggleOrientation() {
			this.store.toggleOrientation(() => {
				if (this.store.state.masonryLayout) {
					this.$nextTick().then(() => {
						this.refreshMacy();
					});
				}
			});
		},

		refreshMacy(categoryKey) {
			if (this.store.state.masonryLayout && this.macyInstances) {
				if (categoryKey) {
					let instance = this.macyInstances.find(instance => {
						return instance.key == categoryKey;
					});
					if (instance) {
						instance.macy.recalculate(true);
						if (this.store.debug)
							console.log(
								'Macy recalculated on cat ',
								categoryKey
							);
					} else {
						if (this.store.debug)
							console.log(
								"There's no instance with key ",
								categoryKey
							);
					}
				} else {
					this.macyInstances.forEach(instance => {
						instance.macy.recalculate(true);
					});
				}
			}
		},

		addSticket(categoryKey) {
			if (
				(this.form.title || this.form.description) &&
				(categoryKey || this.form.categoryKey)
			) {
				this.store.addSticket(
					this.form.title,
					this.form.description,
					categoryKey || this.form.categoryKey
				);
				this.isAdding = false;
				this.withShadow = false;
				this.form.title = '';
				this.form.description = '';
				this.form.categoryKey = '';
			} else {
				console.log('Fill the fields!');
			}
		},

		deleteSticket(sticketKey, categoryKey) {
			this.store.deleteSticket(sticketKey, categoryKey);
		},

		clearStickets() {
			if (_debug !== false) {
				this.store.clearStickets();
			}
		},

		dragSticket(e) {
			dragged = e;
			e.dataTransfer.setData(
				'keys',
				JSON.stringify({
					sticketKey: e.target.attributes['data-key'].value,
					categoryKey: e.target.closest('.m-category').attributes[
						'data-key'
					].value,
				})
			);
		},

		allowDrop(e) {},

		dragEnter(e) {
			let childNodes = e.target
				.closest('.m-category')
				.querySelectorAll('*');
			for (let i = 0; i < childNodes.length; i++) {
				childNodes[i].style.pointerEvents = 'none';
			}
			e.target.closest('.m-category').style.backgroundColor =
				'rgba(0, 0, 0, 0.1)';
		},

		dragLeave(e) {
			let childNodes = e.target
				.closest('.m-category')
				.querySelectorAll('*');
			for (let i = 0; i < childNodes.length; i++) {
				childNodes[i].style.pointerEvents = 'initial';
			}
			e.target.closest('.m-category').style.backgroundColor =
				'transparent';
		},

		dropSticket(e) {
			dropped = e;
			let sticketData = JSON.parse(e.dataTransfer.getData('keys'));
			let newCategoryKey = e.target.closest('.m-category').attributes[
				'data-key'
			].value;
			e.target.closest('.m-category').style.backgroundColor =
				'transparent';

			let childNodes = e.target
				.closest('.m-category')
				.querySelectorAll('*');

			for (let i = 0; i < childNodes.length; i++) {
				childNodes[i].style.pointerEvents = 'initial';
			}

			this.store.moveSticket(
				sticketData.sticketKey,
				sticketData.categoryKey,
				newCategoryKey
			);
		},

		renameCategory(categoryKey) {
			let newName = prompt('¿Cuál será el nuevo nombre?');
			this.store.renameCategory(categoryKey, newName);
		},

		clearCategoryStickets(categoryKey) {
			this.store.clearCategoryStickets(categoryKey);
		},

		removeCategory(categoryKey) {
			if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
				this.store.clearCategory(categoryKey, () => {
					if (this.store.state.masonryLayout) {
						this.macyInstances.splice(
							this.macyInstances.findIndex(instance => {
								return instance.key == categoryKey;
							})
						);
					}
				});
			}
		},

		addCategory() {
			this.store.addCategory(
				prompt('Dale un nombre a la nueva categoría'),
				ref => {
					this.addCategoryWatcher(ref);

					if (this.store.state.masonryLayout) {
						this.$nextTick().then(() => {
							this.initializeMacy(ref);
						});
					}
				}
			);
		},

		initializeMacy(category) {
			this.macyInstances.push({
				key: category.key,
				macy: Macy({
					container:
						'.js-masonry[data-key="' +
						category.key +
						'"] .sticketsWrapper',
					trueOrder: false,
					waitForImages: false,
					columns: 2,
					margin: {
						x: 25,
						y: 25,
					},
					breakAt: {
						480: {
							margin: {
								x: 0,
								y: 30,
							},
							columns: 1,
						},
					},
				}),
			});
		},

		addCategoryWatcher(category) {
			this.categoryWatchers.push({
				key: category.key,
				watcher: this.$watch(
					[
						'store.state.categories',
						this.store.state.categories.indexOf(category),
						'stickets',
					].join('.'),
					function() {
						if (_debug)
							console.log(
								'Category ' + category.key + ' changed!'
							);
						if (this.store.state.masonryLayout)
							this.refreshMacy(category.key);
					},
					{ deep: true }
				),
			});
		},

		addByFocusout(categoryKey) {
			if (this.formHasData) {
				this.addSticket(categoryKey)
			}
		},

		uploadToFirebase() {
			// Add a second document with a generated ID.
			this.db.collection("boards").add({
				id: this.boardKey ? this.boardKey : Math.random().toString(36).substring(2, 7),
				categories: this.store.state.categories
			})
			.then(function(docRef) {
			    console.log("Board written with ID: ", docRef.id);
			})
			.catch(function(error) {
			    console.error("Error adding document: ", error);
			});
		},

		getFromFirebase(boardKey) {
			this.db.collection("boards").where("id", "==", boardKey)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					// doc.data() is never undefined for query doc snapshots
					console.log(doc.id, " => ", doc.data());

					this.store.state.categories = doc.data().categories;
				});
			})
			.catch(function(error) {
				console.log("Error getting documents: ", error);
			});
		}
	},
	beforeMount: function () {
		if (window.location.hash) {
			const url = window.location.hash;
			const boardKey = url.slice(url.indexOf('/')+1, url.length);
			
			if (_debug) console.log("Trying to retrieve data from "+boardKey+" board on Firebase");

			// Initialize Cloud Firestore through Firebase
			this.db = firebase.firestore();
			if (_debug) console.log('Created Firebase Firestore instance!');

			this.getFromFirebase(boardKey)
		}

		// db.collection("users").add({
		//     first: "Ada",
		//     last: "Lovelace",
		//     born: 1815
		// })
		// .then(function(docRef) {
		//     console.log("Document written with ID: ", docRef.id);
		// })
		// .catch(function(error) {
		//     console.error("Error adding document: ", error);
		// });
	},
	mounted: function() {
		this.$nextTick(function() {
			// Code that will run only after the entire view has been rendered

			// Initialize masonry on each category
			// if (this.loading && this.store.state.masonryLayout) {
			// 	this.store.state.categories.forEach(cat => {
			// 		this.initializeMacy(cat);
			// 	});
			// }

			// Hides the loading splash
			this.loading = false;
		});

		// if (this.store.state.masonryLayout && window.innerWidth > 480) {
		// 	this.store.state.categories.forEach(category => {
		// 		this.addCategoryWatcher(category);
		// 	});
		// }


		// Add some watchers

		this.$watch(
			'store.state',
			function() {
				if (_debug) console.log('Store has changed!');

				// localStorage.setItem('storeState', JSON.stringify(store.state));
			},
			{ deep: true }
		);

		this.$watch('store.state.searchField', function(oldValue, newValue) {
			if (_debug)
				console.log(
					'Rendering stickets which matchs with "' +
						this.store.state.searchField.toLowerCase() +
						'"'
				);

			this.$nextTick(() => {
				this.refreshMacy();
			});
		});
	},
	computed: {
		formHasData() {
			return !!this.form.title || !!this.form.description;
		},

		sticketsFiltered() {
			return category => {
				return this.store.state.searchField.length
					? category.stickets.filter(s => {
						return s.title
							.toLowerCase()
							.includes(
								this.store.state.searchField.toLowerCase()
							) ||
							s.description
							.toLowerCase()
							.includes(
								this.store.state.searchField.toLowerCase()
							);
					  })
					: category.stickets;
			};
		},
	},
});
