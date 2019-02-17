class Collective {

	init(data) {
		if(this.checkData(data)) {
			data.collective = {
				"count":data.data.length,
				"group":[0,data.layout.pagination.perPage],
				"pages":Math.ceil(data.data.length/data.layout.pagination.perPage),
				"page":1,
				"filter":[],
				"filteredItems":[]
			};
			this.build(data);
		}
		else {
			console.log('missing data');
		}
	}

	checkData(data) {
		let check;
		check = data.data.length > 0 ? true : false;
		return check;
	}

	build(data) {
		this.app = jQuery('.'+data.id);
		if(this.app.length > 0) {
			this.app.addClass('collective-app');
			this.data = data;
			this.layout(data);
		}
		else {
			console.log('missing element');
		}
	}

	layout(data) {
		data.layout.filter.has ? this.loadFilter() : '';
		data.layout.content.has ? this.loadContent() : '';
		data.layout.bar.has ? this.loadBar() : '';
		data.layout.pagination.has ? this.loadPagination() : '';
	}

	loadFilter() {
		let data, container, content;
		data = this.data;
		container = data.id+'-filter';
		content = `<div class="collective-filter `+container+`"><div class="collective-filter-container"></div></div>`;
		this.app.append(content);
		data.collective.filtered = this.renderFilter(data);
		this.buildFilter();
	}

	loadContent() {
		let data, container, content;
		data = this.data;
		container = data.id+'-content';
		content = `<div class="collective-content"><div class="collective-content-container collective-wrapper `+container+`"></div></div>`;
		this.app.append(content);
	}

	loadBar() {
		let data, container, content;
		data = this.data;
		container = data.id+'-bar';
		content = '<div class="collective-bar '+container+'">bar</div>';
		jQuery('.collective-content').addClass('hasBar').prepend(content);
	}

	loadPagination() {
		let data, container, content;
		data = this.data;
		container = data.id+'-pagination';
		content = '<div class="collective-pagination '+container+'">pagination</div>';
		jQuery('.collective-content').append(content);
		this.renderContent(data,'initial');
	}

	renderFilter(data) {
		let filter, collective, collections;
		filter = data.layout.filter;
		collective = {
			"collections": [],
			"filters": []
		};
		collections = this.getCollections(data);
		if(collections.size > 0) {
			collections.forEach(value => {
				collective.collections.push(value);
				collective.filters[value] = {"set": new Set(), "filter":[], "filterItems":{}};
			});
		}
		this.getFilters(data,collective);
		return collective;
	}

	getCollections(data) {
		let collections = new Set();
		data.data.map((item,index) => {
			if(item.data.collection.length > 1) {

			}
			else {
				if(data.layout.filter.dynamic.exclude.includes(item.data.collection[0])) {

				}
				else {
					collections.add(item.data.collection[0]);
				}
			}
		});
		return collections;
	}

	getFilters(data,obj) {
		data.data.map((item,index) => {
			item.data.collection.map((collection,i) => {
				Object.keys(item.data.filter).forEach(value => {
					obj.filters[collection].set.add(value)
				});
			});
		});
		obj.collections.map((item, index) => {
			if(obj.filters[item].set.size > 0) {
				obj.filters[item].set.forEach(value => {
					obj.filters[item].filter.push(value);
					obj.filters[item].filterItems[value] = {"set": new Set(), "filter":[]};
				});
			}
		});
		this.getfilterItems(data,obj);
	}

	getfilterItems(data,obj) {
		data.data.map((item,index) => {
			item.data.collection.map((collection,i) => {
				Object.keys(item.data.filter).forEach(value => {
					if(Array.isArray(item.data.filter[value])) {
						item.data.filter[value].map(v => obj.filters[collection].filterItems[value].set.add(v));
					}
					else {
						if(item.data.filter[value]) {
							obj.filters[collection].filterItems[value].set.add(item.data.filter[value]);
						}
					}
				});
			});
		});
		obj.collections.map(items => {
			let collection;
			collection = obj.filters[items];
			collection.filter.map(value => {
				collection.filterItems[value].set.forEach(item => {
					collection.filterItems[value].filter.push(item);
				});
			});
		});
	}

	buildFilter() {
		let data, filter, active, markup, collective = new Collective();
		data = this.data;
		filter = data.collective.filtered;
		active = data.layout.bar.collections.dynamic.set;
		filter.collections.map(collection => {
			if(collection == active) {
				`${filter.filters[collection].filter.map((item) => {
					jQuery('.collective-filter-container').append(`
						<div class="collective-filter-collection">
							<div class="collective-filter-collection-title">${item}</div>
							<div class="collective-filter-list">
								${filter.filters[collection].filterItems[item].filter.map(value => {
									return `<div onclick="collective.filterItems({'filter':'${item}','value':'${value}'})">${value}</div>`
								}).join('')}
							</div>
						</div>
					</div>`)
				}).join('')}`
			}
		});
	}

	filterItems(data) {
		console.log(data);
	}

	renderContent(data,local) {
		let container, content, item, items = new Set();
		container = jQuery('.collective-content-container');
		container.html('');	
		
		// has filter
		if(data.collective.filter.length > 0) {
			data.collective.filteredItems = [];
			if(data.data.length > 0) {
				for (var i = 0; i < data.data.length; i++) {
					data.data[i].show = true;
					data.data[i].id = i;
					// for (var ii = 0; ii < data.filter.length; ii++) {
					// 	switch(data.filter[ii].name) {
					// 		case 'price':
					// 			let price, prices, min, max;
					// 			price = Math.round(data.data[i].data.price);
					// 			prices = data.filter[ii].value.split('-');
					// 			min = parseInt(prices[0]);
					// 			max = parseInt(prices[1]);
					// 			if(data.data[i].data.price >= min && data.data[i].data.price <= max) {
					// 				if(data.data[i].show == true) {
					// 					products.add(data.data[i]);
					// 					data.data[i].show = true;
					// 				}
					// 				else {
					// 					data.data[i].show = false;
					// 				}
					// 			}
					// 			else {
					// 				data.data[i].show = false;
					// 			}
					// 		break;
					// 		default:
					// 			if(Array.isArray(data.data[i].data.filter[data.filter[ii].name])) {
					// 				if(data.data[i].data.filter[data.filter[ii].name].includes(data.filter[ii].value)) {
					// 					if(data.data[i].show == true) {
					// 						products.add(data.data[i]);
					// 						data.data[i].show = true;
					// 					}
					// 					else {
					// 						data.data[i].show = false;
					// 					}
					// 				}
					// 				else {
					// 					data.data[i].show = false;
					// 				}
					// 			}
					// 			else {
					// 				if(data.data[i].data.filter[data.filter[ii].name] == data.filter[ii].value) {
					// 					if(data.data[i].show == true) {
					// 						products.add(data.data[i]);
					// 						data.data[i].show = true;
					// 					}
					// 					else {
					// 						data.data[i].show = false;
					// 					}
					// 				}
					// 				else {
					// 					data.data[i].show = false;
					// 				}
					// 			}
					// 		break;
					// 	}
					// }
				}
			}
			else {
				// no results ... kinda
			}
			
		}
		// no filter
		else {
			items = data.data;
			for (var i = 0; i < data.data.length; i++) {
				data.data[i].show = true;
				data.data[i].id = i;
			}
			data.collective.filteredItems = [];
		}

		let active = 0, notactive = 0;
		items.forEach(function(item,ex) {
			if(item.show) {
				active++;
				data.collective.filteredItems.push(item);
			}
			else {
				notactive++;
			}
		});

		if(data.page > 1) {
			console.log('');
		}

		if(active < 1) {
			container.html('<div class="collective-content-message collective-wrapper">Unfortunately there are no results for this filter combination</div>');
			jQuery('.collective-pagination').hide();
			data.count = 0;
			data.pages = 0;
		}
		else {
			jQuery('.collective-content-message').remove();
			jQuery('.collective-pagination').show();
			data.collective.count = active;
			if(local == 'filter'){
				data.collective.page = 1;
				data.collective.group = [0,data.perPage];
			}
			data.collective.pages = Math.ceil(data.collective.filteredItems.length/data.layout.pagination.perPage);
		}

		this.renderPagination(data);

	}

	renderPagination(data) {
		let container, content, list, markup, collective = new Collective();
		container = jQuery('.collective-pagination');
		content = 	`<div class="collective-pagination-container collective-wrapper">
						<div class="collective-pagination-btn" data-event="paginate" data-pagination="prev">
							<<
						</div>
						<div class="collective-pagination-list collective-wrapper">`+data.collective.count+`</div>
						<div class="collective-pagination-btn" data-event="paginate" data-pagination="next">
							>>
						</div>
					</div>`;
		container.html(content);

		jQuery('.collective-pagination-btn').on('click', function() {
			let item, btn;
			item = jQuery(this);
			switch(item.data('pagination')) {
				case 'prev':
					if(data.collective.page > 2) { data.collective.page -= 1; }
					else { data.collective.page = 1; }
				break;
				case 'next':
					if(data.collective.page < data.collective.pages) { data.collective.page += 1; }
					else { data.collective.page = data.collective.pages; }
				break;
				default:
					
				break;
			}
			data.collective.group = [((data.collective.page - 1) * data.layout.pagination.perPage),(data.collective.page * data.layout.pagination.perPage)];
			collective.renderContent(data,'paginate');
		});

		list = jQuery('.collective-pagination-list');
		list.html('<div class="collective-pagination-item collective-wrapper">'+data.collective.page+' of '+data.collective.pages+'</div>');

		markup = data.layout.content.markup.split('@@');
		data.collective.filteredItems.forEach(function(element,index) {
			if(index >= data.collective.group[0] && index < data.collective.group[1]) {
				jQuery('.collective-content-container').append(markup[index]);
			}
		});
	}

	modal(name) {
		console.log(name);
	}

}