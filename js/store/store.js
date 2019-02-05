// Set _debug on true if you want to see the log of all actions
const _debug = true;

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

		let key = new Date().getTime();

		this.getCategory(categoryKey).stickets.push({
			key: key,
			title: title,
			description: description,
		});

		return this.getSticket(key, categoryKey);
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

	addCategory(name, callback) {
		if (this.debug) console.log('addCategory triggered with name: ' + name);

		if (name) {
			let newCategory = {
				key: new Date().getTime(),
				name: name,
				stickets: [],
			};

			this.state.categories.push(newCategory);

			if (callback) callback(this.getCategory(newCategory.key));
		}
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
	clearCategory(categoryKey, callback) {
		if (this.debug) {
			console.log('Category ' + categoryKey + ' removed!');
		}

		store.state.categories.splice(
			store.state.categories.findIndex(
				category => category.key == categoryKey
			),
			1
		);

		if (callback) callback();
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
};