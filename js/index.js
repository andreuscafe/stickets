// Set _debug on true if you want to see the log of all actions
const _debug = false;

let store = {
	debug: _debug !== undefined ? _debug : false,
	state: localStorage.getItem('storeState')
		? JSON.parse(localStorage.getItem('storeState'))
		: {
				horizontalLayout: true,
				masonryLayout: true,
				searchField: '',
				stickets: [],
				categories: [],
		  },
	toggleOrientation(callback) {
		if (this.debug) console.log('Changed orientation');
		this.state.horizontalLayout = !this.state.horizontalLayout;

		if (callback) callback();
	},
	toggleMasonry() {
		if (this.debug) console.log('Toggled masonry layout');
		this.state.masonryLayout = !this.state.masonryLayout;
	},
	addSticket(title, description, categoryKey) {
		if (this.debug)
			console.log(
				'addSticket triggered with title "' +
					title +
					'" and description "' +
					description +
					'" on category ' +
					categoryKey
			);

		for (let i = 0; i < this.state.categories.length; i++) {
			if (this.state.categories[i].key === categoryKey) {
				this.state.categories[i].stickets.push({
					key: new Date().getTime(),
					title: title,
					description: description,
					featured: false
				});

				break;
			}
		}
	},
	deleteSticket(sticketKey, categoryKey) {
		let category = this.getCategory(categoryKey);
		category.stickets.splice(
			category.stickets.findIndex(sticket => {
				return sticket.key == sticketKey;
			}),
			1
		);
	},
	addCategory(placeholder, callback) {
		if (this.debug) console.log('addCategory triggered with placeholder: ' + name);

		let newCategory = {
			key: new Date().getTime(),
			name: '',
			placeholder: placeholder,
			stickets: [],
		};

		this.state.categories.push(newCategory);

		if (callback) callback(this.getCategory(newCategory.key));
	},
	moveSticket(sticketKey, fromKey, toKey) {
		if (this.debug) {
			console.log(
				'Dragged sticket ' +
					sticketKey +
					' from category ' +
					fromKey +
					' to category ' +
					toKey
			);
		}

		let fromCat = this.getCategory(fromKey);

		for (let i = 0; i < fromCat.stickets.length; i++) {
			if (fromCat.stickets[i].key == sticketKey) {
				var sticket = fromCat.stickets.splice(i, 1);

				this.getCategory(toKey).stickets.push(sticket[0]);
			}
		}
	},
	toggleFeaturedSticket(sticketKey, categoryKey) {
		this.getSticket(sticketKey, categoryKey).featured = !this.getSticket(sticketKey, categoryKey).featured
	},
	clearAllStickets() {
		if (this.debug) {
			console.log('All stickets removed!');
		}

		if (confirm('¿Seguro que deseas eliminar todos los stickets?')) {
			for (let i = 0; i < this.state.categories.length; i++) {
				this.state.categories[i].stickets = [];
			}
		}
	},
	clearCategoryStickets(categoryKey) {
		if (this.debug) {
			console.log(
				'All stickets from category ' + categoryKey + ' removed!'
			);
		}

		if (confirm('¿Seguro que deseas eliminar todos los stickets de esta categoría?')) {
			this.getCategory(categoryKey).stickets = [];
		}
	},
	removeCategory(categoryKey, callback) {
		let actuallyRemove = () => {
			store.state.categories.splice(
				store.state.categories.findIndex(
					category => category.key == categoryKey
					), 1
				);

			if (this.debug) console.log('Category ' + categoryKey + ' removed!');
			if (callback) callback();
		}

		if (this.getCategory(categoryKey).stickets.length) {
			if (confirm('¿Seguro que deseas eliminar esta categoría?')) actuallyRemove();
		} else {
			actuallyRemove()
		}
	},
	renameCategory(categoryKey, newName) {
		if (newName) {
			this.getCategory(categoryKey).name = newName;
		}
	},
	getCategory(categoryKey) {
		return store.state.categories.filter(cat => {
			return cat.key == categoryKey;
		})[0];
	},
	getSticket(sticketKey, categoryKey) {
		return this.getCategory(categoryKey).stickets.filter(sticket => {
			return sticket.key == sticketKey;
		})[0];
	},
	fixFeaturedStickets() {
		let hasUndefineds = false;
		this.state.categories.forEach((c) => {
			c.stickets.forEach((s) => {
				if (s.featured == undefined) {
					hasUndefineds = true;
					console.log(s.title);
					s.featured = false
				};
			})
		})

		this.updateLocalstorage();

		if (hasUndefineds) {
			location.reload()
		}
	},
	updateLocalstorage() {
		localStorage.setItem('storeState', JSON.stringify(this.state));
	}
};

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
				this.focusPlaceholder(categoryKey)
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
			this.focusPlaceholder(categoryKey)
		},

		toggleFeaturedSticket(sticketKey, categoryKey) {
			this.store.toggleFeaturedSticket(sticketKey, categoryKey)
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
			let newCategoryKey = e.target.closest('.m-category').attributes['data-key'].value;
			e.target.closest('.m-category').style.backgroundColor = 'transparent';

			let childNodes = e.target
				.closest('.m-category')
				.querySelectorAll('*');

			for (let i = 0; i < childNodes.length; i++) {
				childNodes[i].style.pointerEvents = 'initial';
			}

			if(!(newCategoryKey == sticketData.categoryKey)){
				this.store.moveSticket(
					sticketData.sticketKey,
					sticketData.categoryKey,
					newCategoryKey
				);
			}
		},

		renameCategory(categoryKey) {
			let newName = prompt('¿Cuál será el nuevo nombre?');
			this.store.renameCategory(categoryKey, newName);
		},

		clearCategoryStickets(categoryKey) {
			this.store.clearCategoryStickets(categoryKey);
		},

		removeCategory(categoryKey) {
			this.store.removeCategory(categoryKey, () => {
				if (this.store.state.masonryLayout) {
					this.macyInstances.splice(
						this.macyInstances.findIndex(instance => {
							return instance.key == categoryKey;
						})
					);
				}
			});
		},

		addCategory() {
			let placeholders = [
				'Acá los stickets raros...',
				'Notas mentales...',
				'Necesito comprar...',
				'Por hacer...',
				'En progreso...',
				'Terminado...',
				'Ver luego...',
				'Notas de la reunión...',
				'Links interesantes...',
				'Películas a ver...',
				'Detalles oportunos...',
				'Recordar...',
				'/watch?v=dQw4w9WgXcQ'
			];
			this.store.addCategory(
				placeholders[Math.floor(Math.random() * placeholders.length)],
				ref => {
					this.addCategoryWatcher(ref);

					if (this.store.state.masonryLayout) {
						this.$nextTick().then(() => {
							this.initializeMacy(ref);
							document.querySelector('div[data-key="'+ref.key+'"]').querySelector("textarea.name").focus();
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

		focusPlaceholder(categoryKey) {
			document.querySelector('div[data-key="'+categoryKey+'"]').querySelector(".js-sticketPlaceholder>input").focus();
		}
	},
	mounted: function() {
		document.addEventListener('keydown', e => {
			if (e.keyCode == 65 && e.shiftKey){
				// Shortcut shift + A
				e.preventDefault(); e.stopPropagation();
				this.addCategory();
			} else if (e.keyCode == 70 && (e.metaKey || e.ctrlKey)) {
				// Shortcut cmd/ctrl + F
				e.preventDefault(); e.stopPropagation();
				document.querySelector('.js-search').focus();
			}
 		});

		this.$nextTick(function() {
			// Code that will run only after the
			// entire view has been rendered

			this.store.fixFeaturedStickets();

			if (this.loading && this.store.state.masonryLayout) {
				this.store.state.categories.forEach(cat => {
					this.initializeMacy(cat);
				});
			}

			this.loading = false;
		});

		if (this.store.state.masonryLayout && window.innerWidth > 480) {
			this.store.state.categories.forEach(category => {
				this.addCategoryWatcher(category);
			});
		}

		this.$watch(
			'store.state',
			function() {
				if (_debug) console.log('Store has changed!');

				this.store.updateLocalstorage();
			},
			{ deep: true }
		);

		// Categories watcher
		// this.$watch('store.state.categories', function(oldValue, newValue) {
		// 	console.log(oldValue.length == newValue.length);
		// });

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
