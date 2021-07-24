function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0; 
      let v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

const dummyItems = [
    {
        id: guid(),
        firstName: 'kis',
        lastName: 'pista',
        userName: 'hepcia',
        email: 'kispista@gmail.com',
        function: 'CTO',
        salary: 222,
        createdAt: new Date(1627141936045)
    },
    {
        id: guid(),
        firstName: 'nagy',
        lastName: 'janos',
        userName: 'pingvinKid',
        email: 'willsmith@gmail.com',
        function: 'CEO',
        salary: 100,
        createdAt: new Date(1627141936045 - 1000000)
    }
];

export const SORT_DIRECTION = ['ASC', 'DESC'];

export class GenericTableStore {
    refreshCb = null;           // function
    tableConfig = null;         // table config
    currentItem = null;         // current item for add and edit
    sortableColumns = [];       // which columns should be sorted
    currentSort = [];           // [id, direction]
    searchTerm = '';            // search term
    items = [];                 // unfiltred items
    
    constructor(tableConfig) {
        this.tableConfig = tableConfig;
        this.init();
    }

    init() {
        this.sortableColumns = this.tableConfig.columns.filter(x => x.sorter);
        if (this.sortableColumns.length > 1) {
            this.setSort(this.sortableColumns[0].id);
        }
        this.getList();
        
    }

    // crud method: get/created/update/delete
    getList = () => {
        const Model = this.tableConfig.model;
        this.setItems(dummyItems.map(x => new Model(x)));
    }    

    create = (data) => {
        data.id = guid();
        const Model = this.tableConfig.model;
        const item = new Model(data);
        this.setItems([...this.items, item]);
    }

    update = (data) => {
        this.setItems(this.items.map(item => item.id === data.id ? data : item));
    }

    delete = (deletedItem) => {
        this.setItems(this.items.filter(item => item.id !== deletedItem.id));
    }

    // helper methods for item list

    // set item + refresh the component
    getItems() {
        if (!this.searchTerm) { return this.items; }
        return this.items.filter(item => this.tableConfig.searchFilter(this.searchTerm, item));
    }

    setItems(items) {
        this.items = items;
        if (this.refreshCb) {
            this.refreshCb();
        }
    }

    setCurrentItem(currentItem) {
        if (typeof currentItem === 'undefined') {
            const Model = this.tableConfig.model;
            currentItem = new Model();
        }
        this.currentItem = currentItem;
        if (this.refreshCb) {
            this.refreshCb();
        }
    }
    
    setSort = (id) => {
        const [ASC, DESC] = SORT_DIRECTION;
        const [currentId, direction] = this.currentSort;
        this.currentSort = [id, id === currentId && direction === ASC ? DESC : ASC];
        const column = this.tableConfig.columns.find(c => c.id === id);
        const sortedItems = this.items.sort((user1, user2) => column.sorter(user1, user2) * (this.currentSort[1] === DESC ? -1 : 1))
        this.setItems(sortedItems);
    }

    onSearch = (event) => {
        if (event.key !== "Enter") { return; }
        this.searchTerm = event.target.value.trim();
        if (this.refreshCb) {
            this.refreshCb();
        }
    }

    onSubmit = (inputList, event) => {
        event.preventDefault();
        event.stopPropagation();
        const formData = inputList.reduce((data, inputElem) => {
            data[inputElem.name] = inputElem.value;
            return data;
        }, {});
        const data = Object.assign(this.currentItem, this.tableConfig.beforeFormSubmit(formData));
        event.target.reset();
        if (data.id) {
            this.update(data);
        } else {
            this.create(data);
        }
        this.setCurrentItem(null);
        return false;
    }
}
