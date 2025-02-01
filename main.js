/*
============================= CONSTANTS =============================
*/

const BOOK_DATA_STORAGE_KEY = 'BOOK_DATA_3kVidx2lOmxJ';
const BOOKSHELF_STATE_STORAGE_KEY = 'BOOKSHELF_STATE_oHc6eW3vR';
// const BOOK_INCOMPLETED_COUNT_STORAGE_KEY = 'INCOMPLETED_BOOK_COUNT_bXo9jLfQtDICODINGACADEMY';
// const BOOK_COMPLETED_COUNT_STORAGE_KEY = 'COMPLETED_BOOK_COUNT_P7lQdMpxDldzDICODINGACADEMY';
const RENDERED_BOOKS = [];

const RENDER_EVENT = new Event('RENDER');




/*
============================= UTILITIES =============================
*/ 

/**
 * @returns Boolean
 */
function checkStorageAvailability() {
    const availability = (typeof Storage !== 'undefined');
    if (availability) checkAndInitializeLocalStorage();
    
    return availability;
}

/**
 * @returns String
 */
function generateBookID() {
    return Number(new Date());
}

function checkAndInitializeLocalStorage() {
    if(localStorage.getItem(BOOK_DATA_STORAGE_KEY) === null) 
        localStorage.setItem(BOOK_DATA_STORAGE_KEY, '{}');

    if(localStorage.getItem(BOOKSHELF_STATE_STORAGE_KEY) === null) 
        localStorage.setItem(BOOKSHELF_STATE_STORAGE_KEY, 0);
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
    let parsed_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));

    const new_book_data = {
        id: generateBookID(),
        title: "",
        author: "",
        year: 0,
        isComplete: false,
    };
    Array.from(ev.srcElement.children).forEach(v => {
        const input_element = v.lastElementChild;
        switch(input_element.id) {
            case 'bookFormTitle':
                new_book_data.title = String(input_element.value);
                break;
            case 'bookFormAuthor':
                new_book_data.author = String(input_element.value);
                break;
            case 'bookFormYear':
                new_book_data.year = parseInt(input_element.value);
                break;
            case 'bookFormIsComplete':
                new_book_data.isComplete = input_element.checked;
                break;
        }
    });
    parsed_data[new_book_data.id] = new_book_data;

    localStorage.setItem(BOOK_DATA_STORAGE_KEY, JSON.stringify(parsed_data));
    document.dispatchEvent(RENDER_EVENT);
}



// ----------------- BOOKSHELF EVENT HANDLERS -----------------
function onSearch(ev) {
    ev.preventDefault();
    console.log(localStorage);
    console.log(ev.target.children.namedItem('searchBookTitle').value);
}

function onBookshelfStateChange(ev) {
    if(!checkStorageAvailability()) return;

    localStorage.setItem(BOOKSHELF_STATE_STORAGE_KEY, String(
        (parseInt(localStorage.getItem(BOOKSHELF_STATE_STORAGE_KEY)) + 1) % 2
    ));
}

function onBookItemEdited(ev) {
    ev.preventDefault();
    document.dispatchEvent(RENDER_EVENT);
}
function onBookItemSaved(ev) {
    ev.preventDefault();
    document.dispatchEvent(RENDER_EVENT);
}
function onBookItemCompleted(ev) {
    ev.preventDefault();
    document.dispatchEvent(RENDER_EVENT);
}
function onBookItemIncompleted(ev) {
    ev.preventDefault();
    document.dispatchEvent(RENDER_EVENT);
}
function onBookItemDeleted(ev) {
    ev.preventDefault();
    document.dispatchEvent(RENDER_EVENT);
}

function updateBookshelf(bookshelf) {
    if(!checkStorageAvailability()) return;
    const bookshelf_state = parseInt(localStorage.getItem(BOOKSHELF_STATE_STORAGE_KEY));
    
    if(bookshelf_state === 0) {
        console.log('incompleted bookshelf updated');
    } else {
        console.log('completed bookshelf updated');
    }
}



// ----------------- FOOTER EVENT HANDLERS -----------------
function updateFooterStats(footer) {
    console.log('footer updated');
}



function onDOMContentLoaded(ev) {
    // --- Storage inits ---

    checkAndInitializeLocalStorage();


    // --- Elements ---

    const bookshelf_searchForm = document.getElementById('searchBook');
    const addBookForm = document.getElementById('bookForm');
    const bookshelf_changeStateButton = document.getElementById('toggleBookList');



    // --- Event registration ---

    document.addEventListener('RENDER', (ev) => {
        const bookshelf = document.getElementById('bookshelf');
        const footer = document.getElementsByTagName('footer')[0];
        updateBookshelf(bookshelf);
        updateFooterStats(footer);
    });

    bookshelf_searchForm.addEventListener('submit', onSearch);
    addBookForm.addEventListener('submit', onAddBookFormSubmit);
    bookshelf_changeStateButton.addEventListener('click', onBookshelfStateChange);



    // --- Render event dispatchs ---
    document.dispatchEvent(RENDER_EVENT);
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);