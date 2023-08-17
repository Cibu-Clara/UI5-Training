sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "jquery.sap.storage",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, jQuery, ResourceModel, UIComponent) {
        "use strict";

        return Controller.extend("library.controller.Main", {
            
            arrayOfBooks : [],
            cnt: 0,
		    booksLocalStorage : jQuery.sap.storage(jQuery.sap.storage.Type.local),
            booksArrayKey : "LOCAL_STORAGE_KEY_BOOKS_ARRAY",
            cntLocalStorage : jQuery.sap.storage(jQuery.sap.storage.Type.local),
            cntKey : "LOCAL_STORAGE_KEY_CNT",

            getBooksFromLocalStorage: function () {
                let books = this.booksLocalStorage.get(this.booksArrayKey);
                if (books !== null && books !== ""){
                    this.arrayOfBooks = books;
                }
                else {
                    this.booksLocalStorage.put(this.booksArrayKey, []);
                }
            },
            getCntFromLocalStorage: function() {
                let cnt = this.cntLocalStorage.get(this.cntKey);
                if (cnt !== null && cnt !== "") {
                    this.cnt = cnt;
                }
                else {
                    this.cntLocalStorage.put(this.cntKey, 0);
                } 
            },
            onInit: function () {
                const oView = this.getView();
                const oResourceModel = new ResourceModel({
                bundleName: "library.i18n.i18n" 
                });
                oView.setModel(oResourceModel, "i18n");

                const booksTable = this.getView().byId("booksTable");
                this.getBooksFromLocalStorage();
                this.getCntFromLocalStorage();

                this.arrayOfBooks.forEach(b => {
                    const bookItem = this.addRow(b.title, b.author, b.genre, b.year)
                    booksTable.addItem(bookItem);
                })
            },
            onAddButton: function() {
                this.addBookDialog = sap.ui.xmlfragment("library.view.dialogs.AddBook", this);
                this.getView().addDependent(this.addBookDialog);
                this.addBookDialog.open();
            },
            onAfterCloseAddDialog: function() {
                this.addBookDialog.destroy();
            },
            onCloseAddDialog: function() {
                this.addBookDialog.close();
            },
            onAddDialog: function() {
                const titleInput = sap.ui.getCore().byId("titleInput");
                const authorInput = sap.ui.getCore().byId("authorInput");
                const genreInput = sap.ui.getCore().byId("genreInput");
                const yearInput = sap.ui.getCore().byId("yearInput");

                const title = titleInput.getValue();
                const author = authorInput.getValue();
                const genre = genreInput.getValue();
                const year = yearInput.getValue();
                
                titleInput.setValueState(sap.ui.core.ValueState.None);
                authorInput.setValueState(sap.ui.core.ValueState.None);
                yearInput.setValueState(sap.ui.core.ValueState.None);

                let itExists = false;

                this.arrayOfBooks.forEach(b => {
                    if (b.title === title && b.author === author){
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("bookAlreadyExists"));
                        itExists = true;
                    }
                })

                const isValid = this.validateData(titleInput, authorInput, yearInput);

                if (isValid && ! itExists) {
                    this.cnt++;
                    const newBook = {
                        id: this.cnt,
                        title: title,
                        author: author,
                        genre: genre,
                        year: year
                    };

                    this.arrayOfBooks.push(newBook);
                    this.booksLocalStorage.put(this.booksArrayKey, this.arrayOfBooks);
                    this.cntLocalStorage.put(this.cntKey, this.cnt);

                    const booksTable = this.getView().byId("booksTable");
                    const bookItem = this.addRow(title, author, genre, year);
                    booksTable.addItem(bookItem);

                    this.addBookDialog.close();
                }
            },
            validateData: function(titleInput, authorInput, yearInput) {
                if (titleInput.getValue().trim() !== "" && authorInput.getValue().trim() !== "" && !isNaN(yearInput.getValue()))
                    return true;
                if (titleInput.getValue().trim() === "") {
                    titleInput.setValueState("Error");
                    titleInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("titleFieldEmpty"));
                }
                if (authorInput.getValue().trim() === "") {
                    authorInput.setValueState("Error");
                    authorInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("authorFieldEmpty"));
                }
                if (isNaN(yearInput.getValue())){
                    yearInput.setValueState("Error");
                    yearInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("invalidYear"));
                }
                    return false;
            },
            addRow: function(title, author, genre, year) {
                const cellTitle = new sap.m.Text({text: title});
                const cellAuthor = new sap.m.Text({text: author});
                const cellGenre = new sap.m.Text({text: genre});
                const cellYear = new sap.m.Text({text: year});

                const bookItem = new sap.m.ColumnListItem({
                    cells: [cellTitle,
                        cellAuthor,
                        cellGenre,
                        cellYear]
                    });
                
                return bookItem;
            },
            onUpdateButton: function() {
                const booksTable = this.getView().byId("booksTable");
                const selectedItem = booksTable.getSelectedItem();

                if (selectedItem === null)
                MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("noSelectedBook"));
                else {
                    this.updateBookDialog = sap.ui.xmlfragment("library.view.dialogs.UpdateBook", this);
                    this.getView().addDependent(this.updateBookDialog);
                    this.updateBookDialog.open();

                    const title = selectedItem.getCells()[0].getText();
                    const author = selectedItem.getCells()[1].getText();
                    const genre = selectedItem.getCells()[2].getText();
                    const year = selectedItem.getCells()[3].getText();

                    sap.ui.getCore().byId("titleInput").setValue(title);
                    sap.ui.getCore().byId("authorInput").setValue(author);
                    sap.ui.getCore().byId("genreInput").setValue(genre);
                    sap.ui.getCore().byId("yearInput").setValue(year);
                }
            },
            onAfterCloseUpdateDialog: function() {
                this.updateBookDialog.destroy();
            },
            onCloseUpdateDialog: function() {
                this.updateBookDialog.close();
            },
            onUpdateDialog: function() {
                const titleInput = sap.ui.getCore().byId("titleInput");
                const authorInput = sap.ui.getCore().byId("authorInput");
                const genreInput = sap.ui.getCore().byId("genreInput");
                const yearInput = sap.ui.getCore().byId("yearInput");

                const title = titleInput.getValue();
                const author = authorInput.getValue();
                const genre = genreInput.getValue();
                const year = yearInput.getValue();

                titleInput.setValueState(sap.ui.core.ValueState.None);
                authorInput.setValueState(sap.ui.core.ValueState.None);
                yearInput.setValueState(sap.ui.core.ValueState.None);
                
                const isValid = this.validateData(titleInput, authorInput, yearInput);

                if (isValid) {
                    const booksTable = this.getView().byId("booksTable");
                    const selectedItem = booksTable.getSelectedItem();

                    const index = this.arrayOfBooks.findIndex(book => book.title === selectedItem.getCells()[0].getText()
                    && book.author === selectedItem.getCells()[1].getText());
                    this.arrayOfBooks[index] = {
                        title: title,            
                        author: author,           
                        genre: genre,            
                        year: year,           
                      };
                    this.booksLocalStorage.put(this.booksArrayKey, this.arrayOfBooks);

                    selectedItem.getCells()[0].setText(title);
                    selectedItem.getCells()[1].setText(author);
                    selectedItem.getCells()[2].setText(genre);
                    selectedItem.getCells()[3].setText(year);

                    this.updateBookDialog.close();
                }
            },
            onDeleteButton: function() {
                const booksTable = this.getView().byId("booksTable");
                const selectedItem = booksTable.getSelectedItem();

                if (selectedItem === null)
                MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("noSelectedBook"));
                else {
                    this.deleteBookDialog = sap.ui.xmlfragment("library.view.dialogs.DeleteBook", this);
                    this.getView().addDependent(this.deleteBookDialog);
                    this.deleteBookDialog.open();
                }
            },
            onAfterCloseDeleteDialog: function() {
                this.deleteBookDialog.destroy();
            },
            onCloseDeleteDialog: function() {
                this.deleteBookDialog.close();
            },
            onDeleteDialog: function() {
                const booksTable = this.getView().byId("booksTable");
                const selectedItem = booksTable.getSelectedItem();

                const index = this.arrayOfBooks.findIndex(book => book.title === selectedItem.getCells()[0].getText()
                    && book.author === selectedItem.getCells()[1].getText());
                this.arrayOfBooks.splice(index, 1);
                this.booksLocalStorage.put(this.booksArrayKey, this.arrayOfBooks);

                booksTable.removeItem(selectedItem);
                this.deleteBookDialog.close();
            },
            getRouter: function() {
                return UIComponent.getRouterFor(this);
            },
            onViewButton: function() {
                const booksTable = this.getView().byId("booksTable");
                const selectedItem = booksTable.getSelectedItem();
                if (selectedItem === null)
                    MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("noSelectedBook"));
                else {
                    const index = this.arrayOfBooks.findIndex(book => book.title === selectedItem.getCells()[0].getText()
                    && book.author === selectedItem.getCells()[1].getText());
                    this.getRouter().navTo("bookDetails", {bookId: this.arrayOfBooks[index].id});
                }
            }
        });
    });