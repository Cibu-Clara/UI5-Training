sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox) {
        "use strict";

        return Controller.extend("library.controller.Main", {
            onInit: function () {
                const booksTable = this.getView().byId("booksTable");

                let arrayOfBooks = [{
                    title: "Harry Potter",
                    author: "J.K. Rowling",
                    genre: "Fantasy",
                    year: "1997"
                },
                {
                    title: "The Great Gatsby",
                    author: "F. Scott Fitzgerald",
                    genre: "Tragedy",
                    year: "1925"
                }, 
                {
                    title: "The Lord of the Rings",
                    author: "J.R.R. Tolkien",
                    genre: "Fantasy",
                    year: "1954"
                }, 
                {
                    title: "The Notebook",
                    author: "Nicholas Sparks",
                    genre: "Romance",
                    year: "1996"
                },
                {
                    title: "The Little Prince",
                    author: "Antoine de Saint-Exupéry",
                    genre: "Fantasy",
                    year: "1943"
                }];

                arrayOfBooks.forEach(b => {
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

                if (title.trim() == "") {
                    MessageBox.warning("Title field is empty!");
                    this.emptyFields();
                }
                else if (author.trim() == "") {
                    MessageBox.warning("Author field is empty!");
                    this.emptyFields();
                }
                else if (isNaN(year)){
                    MessageBox.warning("Invalid year of publication!");
                    this.emptyFields();
                }
                else {
                const booksTable = this.getView().byId("booksTable");
                const bookItem = this.addRow(title, author, genre, year);

                booksTable.addItem(bookItem);
                this.addBookDialog.close();
                }
            },
            emptyFields: function() {
                sap.ui.getCore().byId("titleInput").setValue("");
                sap.ui.getCore().byId("authorInput").setValue("");
                sap.ui.getCore().byId("genreInput").setValue("");
                sap.ui.getCore().byId("yearInput").setValue("");
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

                const booksTable = this.getView().byId("booksTable");
                const selectedItem = booksTable.getSelectedItem();

                selectedItem.getCells()[0].setText(title);
                selectedItem.getCells()[1].setText(author);
                selectedItem.getCells()[2].setText(genre);
                selectedItem.getCells()[3].setText(year);

                this.updateBookDialog.close();
            }
        });
    });
