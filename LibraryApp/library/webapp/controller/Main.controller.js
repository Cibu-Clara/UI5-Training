sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
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
            addBook: function() {
                const title = this.getView().byId("titleInput").getValue();
                const author = this.getView().byId("authorInput").getValue();
                const genre = this.getView().byId("genreInput").getValue();
                const year = this.getView().byId("yearInput").getValue();

                const booksTable = this.getView().byId("booksTable");
                const bookItem = this.addRow(title, author, genre, year);

                booksTable.addItem(bookItem);

                this.getView().byId("titleInput").setValue("");
                this.getView().byId("authorInput").setValue("");
                this.getView().byId("genreInput").setValue("");
                this.getView().byId("yearInput").setValue("");
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
            onSelectedItem: function(oEvent) {
                const selectedItem = oEvent.getSource().getSelectedItem();

                const title = selectedItem.getCells()[0].getText();
                const author = selectedItem.getCells()[1].getText();
                const genre = selectedItem.getCells()[2].getText();
                const year = selectedItem.getCells()[3].getText();

                this.getView().byId("titleInput").setValue(title);
                this.getView().byId("authorInput").setValue(author);
                this.getView().byId("genreInput").setValue(genre);
                this.getView().byId("yearInput").setValue(year);
            },
            updateBook: function() {
                const title = this.getView().byId("titleInput").getValue();
                const author = this.getView().byId("authorInput").getValue();
                const genre = this.getView().byId("genreInput").getValue();
                const year = this.getView().byId("yearInput").getValue();

                const booksTable = this.getView().byId("booksTable");
                const selectedItem = booksTable.getSelectedItem();

                selectedItem.getCells()[0].setText(title);
                selectedItem.getCells()[1].setText(title);
                selectedItem.getCells()[2].setText(title);
                selectedItem.getCells()[3].setText(title);
            }
        });
    });
