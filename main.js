/*
============================= CONSTANTS =============================
*/

const BOOK_DATA_STORAGE_KEY = "BOOK_DATA_3kVidx2lOmxJ";
const BOOKSHELF_STATE_STORAGE_KEY = "BOOKSHELF_STATE_oHc6eW3vR";
// const BOOK_INCOMPLETED_COUNT_STORAGE_KEY = "INCOMPLETED_BOOK_COUNT_bXo9jLfQtDICODINGACADEMY";
// const BOOK_COMPLETED_COUNT_STORAGE_KEY = "COMPLETED_BOOK_COUNT_P7lQdMpxDldzDICODINGACADEMY";

const RERENDER_BOOKSHELF_EVENT = new Event("RERENDER_BOOKSHELF_EVENT");




/*
============================= UTILITIES =============================
*/ 

/**
 * @returns {Boolean}
 */
function checkStorageAvailability() {
    const availability = (typeof Storage !== "undefined");
    if (availability) checkAndInitializeLocalStorage();

    return availability;
}

/**
 * @returns {String}
 */
function generateBookID() {
    return Number(new Date());
}

/**
 * Checks if local data is not defined, then sets with default value
 */
function checkAndInitializeLocalStorage() {
    if(localStorage.getItem(BOOK_DATA_STORAGE_KEY) === null) 
        localStorage.setItem(BOOK_DATA_STORAGE_KEY, "{}");
    
    if(localStorage.getItem(BOOKSHELF_STATE_STORAGE_KEY) === null) 
        localStorage.setItem(BOOKSHELF_STATE_STORAGE_KEY, 0);
}


// ----------- ELEMENT BUILDERS -----------

/**
 * @param {int} id
 * @param {string} title
 * @param {string} author
 * @param {int} year
 * @param {boolean} isUnsaved
 * @param {boolean} isComplete
 * @return {HTMLElement} in string form?
 */
function buildBookItemElement(id, title, author, year, isUnsaved, isComplete) {
    const element = document.createElement("div");
    element.classList.add("book-item");
    element.dataset.bookid = String(id);
    element.dataset.testid = "bookItem";

    const additional_message = "";
    const unsaved_indicator = isUnsaved ? `<p class="book-unsaved">* diubah ${additional_message}</p>` : "";

    element.innerHTML = `
        <div class="book-info-wrapper">
            <input onchange="onBookItemEdited(event)" class="fontstyle1 book-title" placeholder="Title" value="${title}" data-testid="bookItemTitle" />
            <div class="book-descriptor"> 
                <input onchange="onBookItemEdited(event)" value="${author}" type="text" placeholder="Author" class="fontstyle0" data-testid="bookItemAuthor" />
                &nbsp;&nbsp;&bull;&nbsp;&nbsp;
                <input onchange="onBookItemEdited(event)" value="${String(year)}" type="text" placeholder="Year" class="fontstyle0" data-testid="bookItemYear" />
            </div>
            ${unsaved_indicator}
        </div>
        <div class="book-option-wrapper">
            <button onclick="onBookItemCompleted(event)" data-testid="bookItemIsCompleteButton"><img src="assets/complete-book.svg" alt="mark complete"/></button>
            <button onclick="onBookItemSaved(event)" data-testid="bookItemEditButton" disabled><img src="assets/edit-book.svg" alt="edit"/></button>
            <button onclick="onBookItemDeleted(event)" data-testid="bookItemDeleteButton"><img src="assets/delete-book.svg" alt="delete"/></button>
        </div>`;
        
    return element;
}


/*
============================== EVENTS ===============================
*/ 

// ----------------- ADD BOOK FORM EVENT HANDLERS -----------------
function onAddBookFormChange(ev) {
    
}

function onAddBookFormSubmit(ev) {
    ev.preventDefault();

    if (!checkStorageAvailability()) return;
    const parsed_book_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));
    
    const new_book_data = {
        id: generateBookID(),
        title: "",
        author: "",
        year: 0,
        isComplete: false,
    };
    Array.from(ev.srcElement.children).forEach(input_group => {
        const input_element = input_group.lastElementChild;
        switch(input_element.id) {
            case "bookFormTitle":
                new_book_data.title = String(input_element.value);
                break;
            case "bookFormAuthor":
                new_book_data.author = String(input_element.value);
                break;
            case "bookFormYear":
                new_book_data.year = parseInt(input_element.value);
                break;
            case "bookFormIsComplete":
                new_book_data.isComplete = input_element.checked;
                break;
        }
    });
    parsed_book_data[new_book_data.id] = new_book_data;

    localStorage.setItem(BOOK_DATA_STORAGE_KEY, JSON.stringify(parsed_book_data));
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}



// ----------------- BOOKSHELF EVENT HANDLERS -----------------
function onSearch(ev) {
    ev.preventDefault();
    console.log(localStorage);
    console.log(ev.target.children.namedItem("searchBookTitle").value);
}

function onBookshelfStateChange(ev) {
    if(!checkStorageAvailability()) return;

    localStorage.setItem(BOOKSHELF_STATE_STORAGE_KEY, String(
        (parseInt(localStorage.getItem(BOOKSHELF_STATE_STORAGE_KEY)) + 1) % 2
    ));
}

function onBookItemEdited(ev) {
    ev.preventDefault();
    console.log('triger onBookItemEdited')
    // document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}
function onBookItemSaved(ev) {
    ev.preventDefault();
    console.log('triger onBookItemSaved')
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}
function onBookItemCompleted(ev) {
    ev.preventDefault();
    console.log('triger onBookItemCompleted')
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}
function onBookItemIncompleted(ev) {
    ev.preventDefault();
    console.log('triger onBookItemIncompleted')
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}
function onBookItemDeleted(ev) {
    ev.preventDefault();
    console.log('triger onBookItemDeleted')

    const this_book_id = ev.srcElement.parentElement.parentElement.dataset.bookid;
    const parsed_book_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));
    for (const id in parsed_book_data) {
        if (id === this_book_id) {
            delete parsed_book_data[id];
        }
    }

    localStorage.setItem(BOOK_DATA_STORAGE_KEY, JSON.stringify(parsed_book_data));
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}

function updateBookshelf(bookshelf_wrapper) {
    if(!checkStorageAvailability()) return;
    const bookshelf_state = parseInt(localStorage.getItem(BOOKSHELF_STATE_STORAGE_KEY));
    const bookshelf = bookshelf_wrapper.children[1];

    
    if(bookshelf_state === 0) {
        console.log("incompleted bookshelf updated");
    } else {
        console.log("completed bookshelf updated");
    }
    bookshelf.innerHTML = "";

    for (const bookitem of Object.entries(JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY)))) {
        bookshelf.appendChild(
            buildBookItemElement(
                bookitem[1].id, 
                bookitem[1].title, 
                bookitem[1].author,
                bookitem[1].year,
                false,
                false
            )
        )
    }
}



// ----------------- FOOTER EVENT HANDLERS -----------------
function updateFooterStats(footer) {

    // Count book stats
    let incompleted_books_count = 0;
    let books_count = 0;
    Object.entries(JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY))).forEach(book =>{
        if (!book[1].isComplete) incompleted_books_count++;
        books_count++;
    });

    // Show stats
    Object.entries(footer.children).forEach(children => {
        const element = children[1];
        const stat_number_children = 0;
        switch(element.id) {
            case "incompleted-books-stat":
                element.children[stat_number_children].innerHTML = incompleted_books_count;
                break;
            case "completed-books-stat":
                element.children[stat_number_children].innerHTML = books_count - incompleted_books_count;
                break;
        }
    });
}



// ----------------- GENERAL EVENT HANDLERS -----------------

function rerenderBookContents(ev) {
    const bookshelf = document.getElementById("bookshelf");
    const footer = document.getElementById("footer");

    updateBookshelf(bookshelf);
    updateFooterStats(footer);
}

function onDOMContentLoaded(ev) {
    // --- Storage inits ---

    checkAndInitializeLocalStorage();
    

    // --- Elements ---

    const bookshelf_searchForm = document.getElementById("searchBook");
    const addBookForm = document.getElementById("bookForm");
    const bookshelf_changeStateButton = document.getElementById("toggleBookList");



    // --- Event registration ---

    document.addEventListener("RERENDER_BOOKSHELF_EVENT", rerenderBookContents);

    bookshelf_searchForm.addEventListener("submit", onSearch);
    addBookForm.addEventListener("submit", onAddBookFormSubmit);
    bookshelf_changeStateButton.addEventListener("click", onBookshelfStateChange);



    // --- Render event dispatchs ---

    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);