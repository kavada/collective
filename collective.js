class Collective {

	init(data) {
		console.log(data);
		if(this.checkData(data)) {
			data.collective = {
				"filter": {},
				"uniqueFilter":[],
				"filtered": this.renderFilter(data),
				"filteredItems":[],
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
		content = `<div class="collective-bar `+container+`">
						<div class="collective-bar-container collective-wrapper">
							<div class="collective-bar-list collective-wrapper"></div>
							<div class="collective-bar-sort">sort</div>
						</div>
					</div>`;
		jQuery('.collective-content').addClass('hasBar').prepend(content);
	}

	loadPagination() {
		let data, container, content;
		data = this.data;
		container = data.id+'-pagination';
		content = '<div class="collective-pagination '+container+'">pagination</div>';
		jQuery('.collective-content').append(content);
		this.reRender(data,'pagination');
	}

	reRender(data,name) {

		switch(name) {
			case 'filter':
				// data.collective.uniqueFilter = this.renderFilterItems(data.collective.filter);
			break;
			case 'bar':
				// this.renderCollective(data);
				// data.rendered.uniqueFilter = [];
				this.buildFilter(data);
				
			break;
			case 'pagination':
				this.buildBar(data);
				this.buildFilter(data);
			break;
		}

		this.renderContent(data);

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
				data.rendered.filters[value] = {};
			});
		}
		this.getFilters(data,collective);
		return collective;
	}

	renderFilterItems(array) {
		const output = [];
		array.forEach(function(item) {
		  var existing = output.filter(function(v, i) {
		    return v.name == item.name;
		  });
		  if (existing.length) {
		    var existingIndex = output.indexOf(existing[0]);
		    output[existingIndex].value = output[existingIndex].value.concat(item.value);
		  } else {
		    if (typeof item.value == 'string')
		      item.value = [item.value];
		    output.push(item);
		  }
		});
		return output;
	}

	getCollections(data) {
		let collections = new Set();
		data.data.map((item,index) => {
			item.show = [];
			item.id = index;
			if(item.collection.length > 1) {

			}
			else {
				collections.add(item.collection[0]);
			}
		});
		return collections;
	}

	getFilters(data,obj) {
		data.data.map((item,index) => {
			item.collection.map((collection,i) => {
				Object.keys(item.filter).forEach(value => {
					obj.filters[collection].set.add(value)
				});
			});
		});
		obj.collections.map((item, index) => {
			if(obj.filters[item].set.size > 0) {
				obj.filters[item].set.forEach(value => {
					obj.filters[item].filter.push(value);
					obj.filters[item].filterItems[value] = {"set": new Set(), "filter":[], "active":[]};
					data.rendered.filters[item][value] = [];
				});
			}
		});
		this.getfilterItems(data,obj);
	}

	getfilterItems(data,obj) {
		data.data.map((item,index) => {
			item.collection.map((collection,i) => {
				Object.keys(item.filter).forEach(value => {
					if(Array.isArray(item.filter[value])) {
						item.filter[value].map(v => obj.filters[collection].filterItems[value].set.add(v));
					}
					else {
						if(item.filter[value]) {
							obj.filters[collection].filterItems[value].set.add(item.filter[value]);
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

	buildBar(data) {
		let active;
		jQuery('.collective-bar-list').html(''); // remove content
		`${data.collective.filtered.collections.map((collection) => {
			if(collection == data.rendered.set) { active = 'active'; } else { active = ''; }
			jQuery('.collective-bar-list').append(`
				<div class="collective-bar-item ${active}" onclick="collective.barItem('${collection}'); jQuery(this).siblings().removeClass('active'); jQuery(this).addClass('active')">${collection}</div>
			`)
		}).join('')}`
	}

	buildFilter(data) {
		let filter, active, markup, collective = new Collective();
		jQuery('.collective-filter-container').html(''); // remove content
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
									return `<div class="collective-filter-item" onclick="collective.filterItems(this,{'name':'${item}','value':'${value}'});">${value}</div>`
								}).join('')}
							</div>
						</div>
					</div>`)
				}).join('')}`
			}
		});
	}

	barItem(value) {
		let data;
		data = this.data;
		data.rendered.set = value;
		data.layout.filter.dynamic.set = value;
		data.layout.bar.collections.dynamic.set = value;
		data.rendered.uniqueFilter = [];
		this.reRender(data,'bar');
		console.log(data);
	}

	filterItems(element,value) {
		let data, item, curFilter, curIndex;
		data = this.data;
		item = jQuery(element);
		if(item.hasClass('active')) {
			item.removeClass('active');
			curFilter = data.rendered.filters[data.layout.filter.dynamic.set][value.name];
			curIndex = curFilter.indexOf(value.value);
			if (curIndex > -1) {
				curFilter.splice(curIndex, 1);
			}
		}
		else {
			item.addClass('active');
			data.rendered.filters[data.layout.filter.dynamic.set][value.name].push(value.value);
		}
		this.checkFilters();
		this.renderContent(data);
		this.rePaginate(data);
	}

	checkFilters() {
		let data, currentSet, unique = [];
		data = this.data;
		currentSet = data.layout.filter.dynamic.set;
		Object.keys(data.rendered.filters[currentSet]).map(v => {
			if(data.rendered.filters[currentSet][v].length > 0) {
				unique.push({"filter":v,"value":data.rendered.filters[currentSet][v]})
			}
		});
		data.rendered.uniqueFilter = unique;
	}

	rePaginate(data) {
		data.collective.count = data.rendered.uniqueMarkup.length;
		data.collective.group = [0,data.layout.pagination.perPage];
		data.collective.pages = Math.ceil(data.rendered.uniqueMarkup.length/data.layout.pagination.perPage);
		data.collective.page = 1;
		jQuery('.collective-pagination-list').html('<div class="collective-pagination-item collective-wrapper">'+data.collective.page+' of '+data.collective.pages+'</div>');
	}

	compareObjects(a,b) {
		return JSON.stringify(a) === JSON.stringify(b);
	}

	renderContent(data,local) {
		let markup, collective = new Collective();

		markup = data.layout.content.markup.split('@@');
		data.rendered.masterMarkup = markup;

		if(data.rendered.uniqueFilter.length > 0) {
			data.rendered.uniqueFilter.map(item => {
				data.data.forEach(function(element,index) {
					data.data[index].show = [];
						if(element.collection.includes(data.rendered.set)) {
							
							Object.keys(data.data[index].filter).map((items, indexes) => {

							// if(data.data[index].filter.hasOwnProperty(items)) {
							// 	console.log('has property');
								if(data.rendered.filters[data.rendered.set][items].length < 1) {
									data.data[index].show.push(1);
								}
								else {
									if(data.rendered.filters[data.rendered.set][items].includes(data.data[index].filter[items])) {
										data.data[index].show.push(1);
									}
									else {
										data.data[index].show.push(0);	
									}
								}
							// }
							// else {
							// 	console.log('does not have property');	
							// }
							// if(data.rendered.filters[data.rendered.set][items].includes(data.data[index].filter[items])) {
							// 	data.data[index].show.push(1);
							// }
							// else {
							// 	if(data.data[index].filter[items].hasOwnProperty(items)) {
									
							// 		else {
							// 			data.data[index].show.push(0);
							// 		}
							// 	}
							// 	else {
							// 		data.data[index].show.push(0);
							// 	}
							// }

						});
						data.data[index].id = index;
					}
				});
			});
		}
		else {
			data.rendered.uniqueMarkup = [];
			data.rendered.markup = [];
			data.data.forEach(function(element,index) {
				element.show = [];
				if(element.collection.includes(data.rendered.set)) {
					data.rendered.markup.push(markup[index]);
				}
			});
			data.rendered.uniqueMarkup = data.rendered.markup;
		}
		
		this.buildPagination(data);
	}

	renderUniqueContent() {
		let markup = [];
		return markup;
	}

	renderFilteredContent(data) {
		let container, content, list, sum;
		container = jQuery('.collective-content-container');
		list = jQuery('.collective-pagination-list');
		container.html('');

		data.rendered.uniqueMarkup = [];
		data.data.forEach(function(element,index) {
			if(element.collection.includes(data.rendered.set)) {
				sum = element.show.reduce(function(a, b) { return a + b; }, 0);
				if(element.show.length == sum) {
					data.rendered.uniqueMarkup.push(data.rendered.masterMarkup[index]);
				}
			}
		});

		data.rendered.uniqueMarkup.map((element,index) => {
			if(index >= data.collective.group[0] && index < data.collective.group[1]) {
				container.append(element);
			}
		});

		list.html('<div class="collective-pagination-item collective-wrapper">'+data.collective.page+' of '+data.collective.pages+'</div>');
	}

	buildPagination(data) {
		let container, content, list, markup, collective = new Collective();
		container = jQuery('.collective-pagination');

		data.collective.count = data.rendered.uniqueMarkup.length;
		data.collective.group = [0,data.layout.pagination.perPage];
		data.collective.pages = Math.ceil(data.rendered.uniqueMarkup.length/data.layout.pagination.perPage);
		data.collective.page = 1;

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
			collective.renderFilteredContent(data,'paginate');
		});

		this.renderFilteredContent(data);

	}

	modal(name) {
		console.log(name);
	}

}