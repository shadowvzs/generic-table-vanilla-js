import { SORT_DIRECTION } from './generic-table-store.mjs';
import { BaseComponent } from './base-component.mjs';

export class GenericTableComponent extends BaseComponent {
    tableConfig = null;
    store = null;

    constructor(store) {
        super();
        this.store = store;
        this.store.refreshCb = this.refresh;
        this.tableConfig = store.tableConfig;
    }

    renderTable = () => {
        const headRow = this.renderHeadRow();
        const bodyRows = this.store.getItems().map(item => this.renderBodyRow(item));
        const table = this.renderElement('table', this.tableConfig.attributes, [headRow, ...bodyRows]);
        return this.renderElement('div', { className: 'table-container' }, [table]);
    }

    renderHeadRow = () => {
        const cells = this.tableConfig.columns.map(column => {
            const td = this.renderTableHeadCell(column);
            return td;
        });
        const actionCell = this.renderElement('th', {}, ['Actions']);
        return this.renderElement('tr', {}, [...cells, actionCell]);
    }

    renderBodyRow = (item) => {
        const cells = this.tableConfig.columns.map(column => {
            const td = this.renderTableCell(column.attributes, [column.getCellValue(item)]);
            return td;
        });

        const editAction = this.renderElement('button', { className: 'edit-btn', onclick: () => this.store.setCurrentItem(item) }, ['edit']);
        const deleteAction = this.renderElement('button', { className: 'delete-btn', onclick: () => this.store.delete(item) }, ['delete']);

        const actions = [editAction, deleteAction];
        const actionCell = this.renderTableCell({}, actions);
        return this.renderElement('tr', {}, [...cells, actionCell]);
    }

    renderTableCell = (attributes, children) => {
        return this.renderElement('td', attributes, children);
    }

    renderTableHeadCell = (column) => {
        const [ASC] = SORT_DIRECTION;
        const attributes = Object.assign({ className: 'sortable' }, column.attributes);
        const children = [this.renderElement('span', column.attributes, [column.label])];
        const [sortId, direction] = this.store.currentSort;
        if (column.sorter) {
            attributes.onclick = () => this.store.setSort(column.id);
            if (sortId === column.id) {
                const arrow = this.renderElement('span', { className: 'sort-arrow' }, [direction === ASC ? '↑': '↓']);
                children.push(arrow);
            }
        }

        return this.renderElement('th', attributes, children);
    }

    renderForm = () => {
        const item = this.store.currentItem;
        const { formFields } = this.tableConfig;
        const title =  this.renderElement('h2', {}, [item.id ? 'Edit Form' : 'Add Form']);
        const inputList = formFields.map(fieldAttributes => this.renderElement('input', {...fieldAttributes, value: item[fieldAttributes.name] || ''}, []));
        const cancelButton = this.renderElement('button', { type: 'button', onclick: () => this.store.setCurrentItem(null) }, ['Cancel']);
        const submitButton = this.renderElement('input', { value: 'Save', type: 'submit' }, []);
        
        const form = this.renderElement('form', { onsubmit: (event) => this.store.onSubmit(inputList, event) }, [title, ...inputList, cancelButton, submitButton])
        return this.renderElement('div', { className: 'add-edit-form' }, [form]); 
    }

    renderSearchBar = () => {
        const searchInput = this.renderElement('input', { placeholder: 'search', value: this.store.searchTerm, onkeyup: this.store.onSearch }, []);
        return this.renderElement('div', { className: 'search-container' }, [searchInput]);
    }

    renderAddButton = () => {
        const button = this.renderElement('button', { onclick: () => this.store.setCurrentItem() })
        return this.renderElement('div', { className: 'add-container' }, [button]);
    }

    render() {
        const children = [
            this.renderSearchBar(),
            this.renderAddButton(),
            this.renderTable()
        ];

        if (this.store.currentItem) {
            children.push(this.renderForm());
        }
        return this.renderElement('div', { className: 'generic-table' }, children);
    }
}
