const STORAGE_KEY = "LIST_BOOK";
const ID_UNREAD = "unread";
const ID_READ = "read";
const ID_BOOK = "booksID";

let books = [];

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
  document.dispatchEvent(new Event("ondatasaved"));
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) books = data;
  document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
  if (isStorageExist()) saveData();
}

function booksObject(title, author, year, isCompleted) {
  return {
    id: +new Date(),
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (book of books) {
    if (book.id === bookId) return book;
  }
  return null;
}

function findBookIndex(bookId) {
  let index = 0;
  for (book of books) {
    if (book.id === bookId) return index;
    index++;
  }
  return -1;
}

function refreshDataFromBooks() {
  const listUnread = document.getElementById(ID_UNREAD);
  let listRead = document.getElementById(ID_READ);

  for (book of books) {
    const newBook = inputBook(
      book.title,
      book.author,
      book.year,
      book.isCompleted
    );
    newBook[ID_BOOK] = book.id;

    if (book.isCompleted) {
      listRead.append(newBook);
    } else {
      listUnread.append(newBook);
    }
  }
}

function addBook() {
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputBookAuthor = document.getElementById("inputBookAuthor").value;
  const inputBookYear = document.getElementById("inputBookYear").value;
  const inputRead = document.getElementById("inputBookIsComplete").checked;

  console.log("Judul: " + inputBookTitle);
  console.log("Penulis: " + inputBookAuthor);
  console.log("Tahun: " + inputBookYear);
  console.log("Selesai Dibaca: " + inputRead);

  const book = inputBook(
    inputBookTitle,
    inputBookAuthor,
    inputBookYear,
    inputRead
  );
  const bookObject = booksObject(
    inputBookTitle,
    inputBookAuthor,
    inputBookYear,
    inputRead
  );

  book[ID_BOOK] = bookObject.id;
  books.push(bookObject);

  if (inputRead) {
    document.getElementById(ID_READ).append(book);
  } else {
    document.getElementById(ID_UNREAD).append(book);
  }
  updateDataToStorage();
}

function inputBook(inputTitle, inputAuthor, inputYear, inputRead) {
  const bookTitle = document.createElement("h3");
  bookTitle.classList.add("book-title");
  bookTitle.innerText = inputTitle;

  const bookAuthor = document.createElement("p");
  bookAuthor.classList.add("book-details");
  bookAuthor.innerText = inputAuthor;

  const bookYear = document.createElement("p");
  bookYear.classList.add("book-details");
  bookYear.innerText = inputYear;

  const buttons = document.createElement("div");
  buttons.classList.add("book-buttons");
  buttons.append(buttonMove(inputRead));
  buttons.append(buttonEdit());
  buttons.append(buttonDelete());

  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book-card");
  bookContainer.append(bookTitle, bookAuthor, bookYear, buttons);

  return bookContainer;
}

function createButton(buttonType, buttonText, eventListener) {
  const button = document.createElement("button");
  button.innerText = buttonText;
  button.classList.add(buttonType);
  button.addEventListener("click", function (event) {
    eventListener(event);
  });
  return button;
}

function buttonMove(status) {
  return createButton(
    "move-button",
    status ? "Belum Selesai" : "Selesai",
    function (event) {
      if (status) {
        undoBookFromCompleted(event.target.parentElement.parentElement);
      } else {
        addBookToCompleted(event.target.parentElement.parentElement);
      }
    }
  );
}

function buttonEdit() {
  return createButton("edit-button", "Edit", function (event) {
    editBook(event.target.parentElement.parentElement);
  });
}

function buttonDelete() {
  return createButton("delete-button", "Hapus", function (event) {
    removeBook(event.target.parentElement.parentElement);
  });
}

function addBookToCompleted(taskElement) {
  const book = findBook(taskElement[ID_BOOK]);
  book.isCompleted = true;

  const newBook = inputBook(
    book.title,
    book.author,
    book.year,
    (inputRead = true)
  );
  newBook[ID_BOOK] = book.id;

  const bookCompleted = document.getElementById(ID_READ);
  bookCompleted.append(newBook);

  taskElement.remove();
  updateDataToStorage();
}

function editBook(taskElement) {
  const edit = document.querySelector("#edit-section");
  edit.removeAttribute("hidden");
  const book = findBook(taskElement[ID_BOOK]);

  const editBookTitle = document.getElementById("editBookTitle");
  editBookTitle.value = book.title;
  const editBookAuthor = document.getElementById("editBookAuthor");
  editBookAuthor.value = book.author;
  const editBookYear = document.getElementById("editBookYear");
  editBookYear.value = book.year;
  const editRead = document.getElementById("editRead");
  editRead.checked = book.isCompleted;

  const submitEdit = document.getElementById("edit-submit");
  submitEdit.addEventListener("click", function (event) {
    updateEditBook(
      editBookTitle.value,
      editBookAuthor.value,
      editBookYear.value,
      editRead.checked,
      book.id
    );

    const edit = document.querySelector(".edit-section");
    edit.setAttribute("hidden", "");
  });
}

function updateEditBook(title, author, year, inputBookIsComplete, id) {
  const bookStorage = JSON.parse(localStorage[STORAGE_KEY]);
  const bookIndex = findBookIndex(id);

  bookStorage[bookIndex] = {
    id: id,
    title: title,
    author: author,
    year: year,
    isCompleted: inputBookIsComplete,
  };

  const parsed = JSON.stringify(bookStorage);
  localStorage.setItem(STORAGE_KEY, parsed);

  location.reload(true);
}

function removeBook(taskElement) {
  const hapus = confirm("Hapus Buku Ini?");
  if (hapus) {
    const bookPosition = findBookIndex(taskElement[ID_BOOK]);
    books.splice(bookPosition, 1);

    taskElement.remove();
    updateDataToStorage();
  }
}

function undoBookFromCompleted(taskElement) {
  const book = findBook(taskElement[ID_BOOK]);
  book.isCompleted = false;

  const newBook = inputBook(
    book.title,
    book.author,
    book.year,
    book.isCompleted
  );
  newBook[ID_BOOK] = book.id;

  const uncompletedRead = document.getElementById(ID_UNREAD);
  uncompletedRead.append(newBook);

  taskElement.remove();
  updateDataToStorage();
}

function searchBook(keyword) {
  const bookList = document.querySelectorAll(".book-card");
  for (let book of bookList) {
    const title = book.childNodes[0];
    if (!title.innerText.toLowerCase().includes(keyword)) {
      title.parentElement.style.display = "none";
    } else {
      title.parentElement.style.display = "";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function () {
    addBook();
  });

  const closeForm = document.getElementById("close-form");
  closeForm.addEventListener("click", function () {
    const edit = document.querySelector("#edit-section");
    edit.setAttribute("hidden", "");
  });

  const searchButton = document.getElementById("searchSubmit");
  searchButton.addEventListener("click", function () {
    const keyword = document.getElementById("searchBookTitle").value;
    searchBook(keyword.toLowerCase());
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener("ondatasaved", () => {
  console.log("Data disimpan.");
});
document.addEventListener("ondataloaded", () => {
  refreshDataFromBooks();
});
