sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "jquery.sap.storage"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, jQuery) {
        "use strict";

        return Controller.extend("library.controller.Main", {
            
            arrayOfBooks : [],
            localStorageKey : "LOCAL_STORAGE_KEY",
		    booksLocalStorage : jQuery.sap.storage(jQuery.sap.storage.Type.local),

            getBooksFromLocalStorage: function () {
                let books = this.booksLocalStorage.get(this.localStorageKey);
                if (books != null && books != "")
                    this.arrayOfBooks = books;
            },
            onInit: function () {
                const booksTable = this.getView().byId("booksTable");
                this.getBooksFromLocalStorage();

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
                const title = sap.ui.getCore().byId("titleInput").getValue();
                const author = sap.ui.getCore().byId("authorInput").getValue();
                const genre = sap.ui.getCore().byId("genreInput").getValue();
                const year = sap.ui.getCore().byId("yearInput").getValue();
                
                let itExists = false;

                this.arrayOfBooks.forEach(b => {
                    if (b.title === title && b.author === author){
                        MessageBox.warning("Book already exists!");
                        itExists = true;
                    }
                })

                const isValid = this.validateData(title, author, year);

                if (isValid === true && itExists === false) {
                    const newBook = {
                        title: title,
                        author: author,
                        genre: genre,
                        year: year
                    };

                    let books = this.booksLocalStorage.get(this.localStorageKey);
                    books.push(newBook);
                    this.booksLocalStorage.put(this.localStorageKey, books);

                    const booksTable = this.getView().byId("booksTable");
                    const bookItem = this.addRow(title, author, genre, year);
                    booksTable.addItem(bookItem);

                    this.addBookDialog.close();
                }
            },
            validateData: function(title, author, year) {
                if (title.trim() === "") {
                    MessageBox.warning("Title field is empty!");
                    return false;
                }
                else if (author.trim() === "") {
                    MessageBox.warning("Author field is empty!");
                    return false;
                }
                else if (isNaN(year)){
                    MessageBox.warning("Invalid year of publication!");
                    return false;
                }
                else return true;
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
                    MessageBox.error("No selected book!")
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
                const title = sap.ui.getCore().byId("titleInput").getValue();
                const author = sap.ui.getCore().byId("authorInput").getValue();
                const genre = sap.ui.getCore().byId("genreInput").getValue();
                const year = sap.ui.getCore().byId("yearInput").getValue();
                
                const isValid = this.validateData(title, author, year);

                if (isValid === true) {
                    const booksTable = this.getView().byId("booksTable");
                    const selectedItem = booksTable.getSelectedItem();

                    let books = this.booksLocalStorage.get(this.localStorageKey);
                    const index = books.findIndex(book => book.title === selectedItem.getCells()[0].getText()
                    && book.author === selectedItem.getCells()[1].getText());
                    books[index] = {
                        title: title,            
                        author: author,           
                        genre: genre,            
                        year: year,           
                      };
                    this.booksLocalStorage.put(this.localStorageKey, books);

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
                    MessageBox.error("No selected book!")
                else {
                    this.deleteBookDialog = sap.ui.xmlfragment("library.view.dialogs.DeleteBook", this);
                    this.getView().addDependent(this.deleteBookDialog);
                    this.deleteBookDialog.open();
                }
            },
            onAfterCloseDeleteDialog: function() {
                this.addBookDialog.destroy();
            },
            onCloseDeleteDialog: function() {
                this.addBookDialog.close();
            },
            onDeleteDialog: function() {
                const booksTable = this.getView().byId("booksTable");
                const selectedItem = booksTable.getSelectedItem();

                let books = this.booksLocalStorage.get(this.localStorageKey);
                const index = books.findIndex(book => book.title === selectedItem.getCells()[0].getText()
                    && book.author === selectedItem.getCells()[1].getText());
                books.splice(index, 1);
                this.booksLocalStorage.put(this.localStorageKey, books);

                booksTable.removeItem(selectedItem);
                this.deleteBookDialog.close();
            }
        });
    });
