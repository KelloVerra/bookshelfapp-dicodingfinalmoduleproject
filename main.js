/*
============================= CONSTANTS =============================
*/

const BOOK_DATA_STORAGE_KEY = "BOOK_DATA_3kVidx2lOmxJ";
const BOOKLIST_STATE_STORAGE_KEY = "BOOKSHELF_STATE_oHc6eW3vR";

const MAX_TITLE_CHARS = 22;
const REGEX_INVALID_CHARSET = /[\^\*"'#%{}[\]`<>¬@\\]/;
const REGEX_INVALID_CHARSTART = /[\s/]/;

const RENDERED_BOOKLIST = [];
const RERENDER_BOOKSHELF_EVENT = new Event("RERENDER_BOOKSHELF_EVENT");

const SESSIONDATA = {has_unsaved_data: false};




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
 * @returns {String} separated by commas
 */
function combineStrings() {
    if (arguments.length === 0) return "";
    return Array.from(arguments).reduce((prev, curr) => {
        return `${prev}, ${curr}`;
    });
}

/**
 * Checks if local data is not defined, then sets with default value
 */
function checkAndInitializeLocalStorage() {
    if(localStorage.getItem(BOOK_DATA_STORAGE_KEY) === null) 
        localStorage.setItem(BOOK_DATA_STORAGE_KEY, "{}");
    
    if(localStorage.getItem(BOOKLIST_STATE_STORAGE_KEY) === null) 
        localStorage.setItem(BOOKLIST_STATE_STORAGE_KEY, 0);
}

/**
 * Alert user when they have unsaved book item
 * @returns {Boolean} of the availability of an unsaved data
 */
function alertUnsaved() {
    if (SESSIONDATA.has_unsaved_data) {
        window.alert("You have unsaved book data.");
        return true;
    }
    return false;
}

/**
 * Updates the status of the booklist whether they have an unsaved book item or not
 */
function updateUnsaved(booklist) {
    let unsaved_item_count = 0;
    for (let i = 0; i < booklist.children.length; i++)
        if (booklist.children.item(i).dataset.unsaved === "true") unsaved_item_count++;

    SESSIONDATA.has_unsaved_data = unsaved_item_count > 0;
}


// ----------- ELEMENT BUILDERS -----------

/**
 * @param {int} id
 * @param {string} title
 * @param {string} author
 * @param {int} year
 * @param {boolean} isComplete
 * @return {HTMLElement} of the book item
 */
function buildBookItemElement(id, title, author, year, isComplete, order) {
    const element = document.createElement("div");
    element.classList.add("book-item");
    element.style = `animation: bookitem-fade-in 300ms ease-out ${( order < 5 ? order * 90 : order * 20 + 4 * 90 )}ms forwards;`;
    element.dataset.unsaved = false;
    element.dataset.bookid = String(id);
    element.dataset.testid = "bookItem";

    // TODO: CHECK THE TEST IDS!!!
    element.innerHTML = `
        <div class="book-info-wrapper" oninput="onBookItemEdited(event, this)">
            <input class="fontstyle1 book-title" placeholder="Judul" value="${title}" maxlength="30" inputmode="latin" data-testid="bookItemTitle" />
            <div class="book-descriptor"> 
                <input value="${author}" type="text" placeholder="Penulis" class="fontstyle0" maxlength="30" inputmode="latin" data-testid="bookItemAuthor" />
                &nbsp;&nbsp;&bull;&nbsp;&nbsp;
                <input value="${String(year)}" type="text" placeholder="Tahun" class="fontstyle0" inputmode="numeric" data-testid="bookItemYear" />
            </div>
            <p class="book-unsaved" data-type="unsaved-message"></p>
        </div>
        <div class="book-option-wrapper">
            ${ !isComplete ?
                `<button onclick="onBookItemCompleted(event)" data-testid="bookItemIsCompleteButton"><img src="assets/complete-book.svg" alt="mark read"/></button>` :
                `<button onclick="onBookItemIncompleted(event)" data-testid="bookItemIsCompleteButton"><img src="assets/move-book.svg" alt="mark unread"/></button>`}
            ${  !isComplete ?
                `<button onclick="onBookItemSaved(event)" data-testid="bookItemEditButton" disabled><img src="assets/edit-book.svg" alt="edit"/></button>` :
                `<button onclick="onBookItemSaved(event)" data-testid="bookItemEditButton" disabled><img src="assets/edit-book-alt.svg" alt="edit"/></button>`}
            ${  !isComplete ?
                `<button onclick="onBookItemDeleted(event)" data-testid="bookItemDeleteButton"><img src="assets/delete-book.svg" alt="delete"/></button>` :
                `<button onclick="onBookItemDeleted(event)" data-testid="bookItemDeleteButton"><img src="assets/delete-book-alt.svg" alt="delete"/></button>`}
        </div>`;
        
    return element;
}


/*
============================== EVENTS ===============================
*/ 

// ----------------- ADD BOOK FORM EVENT HANDLERS -----------------
function onAddBookInputChange(input_element) {
    // custom per input validation
    const semantic_indicator_element = input_element.parentElement.firstElementChild.firstElementChild;
    let semantic_message = "";


    if(input_element.id === "bookFormYear") {
        if(parseInt(input_element.value) < 1) semantic_message = `Nilai tidak boleh dibawah 1`;
        if(parseInt(input_element.value) > new Date().getFullYear()) semantic_message = `Tidak boleh menandakan rilis di masa depan`;
    } else {
        if(REGEX_INVALID_CHARSET.test(input_element.value)) semantic_message = `Tidak boleh mengandung karakter invalid`;
        if(REGEX_INVALID_CHARSTART.test(input_element.value[0])) semantic_message = `Tidak boleh diawali dengan karakter invalid`;
        if(input_element.value.length > MAX_TITLE_CHARS) semantic_message = `Tidak boleh melebihi ${MAX_TITLE_CHARS} karakter`;
    }
    if(input_element.value.length === 0) semantic_message = `Mohon diisi dengan valid`;
    
    semantic_indicator_element.innerHTML = semantic_message === "" ? "*" : `* (${semantic_message})`;
    semantic_indicator_element.parentElement.parentElement.dataset.has_error = semantic_message !== "";
}
function onAddBookIsCompleteChecked(check_element) {
    const add_book_submit_destination_element = document.querySelector("#bookFormSubmit").lastElementChild;
    add_book_submit_destination_element.innerHTML = check_element.checked ? "Sudah dibaca" : "Belum dibaca";
}
function onAddBookFormInput(form_element) {
    const submit_button = document.querySelector("#bookFormSubmit");
    
    // check all required input's validation
    let can_submit = 0;
    for(let i = 0; i < 3; i++) {
        const form_children_element = form_element.children.item(i);
        if (form_children_element.dataset.has_error === "false") can_submit++; 
    }

    submit_button.disabled = Boolean(can_submit !== 3);
}

function onAddBookFormSubmit(ev) {
    ev.preventDefault();

    if (!checkStorageAvailability()) return;
    const parsed_booklist_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));
    const generated_id = generateBookID();
    
    const new_book_data = {
        id: generated_id,
        title: "",
        author: "",
        year: 0,
        isComplete: false,
    };
    Array.from(ev.target.children).forEach(input_group => {
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
    const pre_inserted_new_book_data = {};
    pre_inserted_new_book_data[generated_id] = new_book_data;
    const new_booklist_data = {...pre_inserted_new_book_data, ...parsed_booklist_data}; 

    localStorage.setItem(BOOK_DATA_STORAGE_KEY, JSON.stringify(new_booklist_data));
    RENDERED_BOOKLIST.unshift(new_book_data);
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}




// ----------------- BOOKSHELF EVENT HANDLERS -----------------
function onSearch(ev) {
    ev.preventDefault();

    const booklist_state = parseInt(localStorage.getItem(BOOKLIST_STATE_STORAGE_KEY));
    const booklist = document.querySelector("#bookshelf").children.item(1);
    const search_box = document.querySelector("#searchBookTitle");
    const search_query = new RegExp(search_box.value, "i");

    booklist.innerHTML = "";

    const queried_book_items = RENDERED_BOOKLIST.filter(v => {
        let matches = 0;
        if (search_query.test(v.title)) matches++; 
        if (search_query.test(v.author)) matches++; 
        if (search_query.test(v.year)) matches++; 
        return matches > 0;
    });

    let iteration = 0;
    for (const bookitem of queried_book_items) {

        const display_state = bookitem.isComplete ? 0 : 1;
        if(booklist_state === display_state) continue;

        booklist.appendChild(
            buildBookItemElement(
                bookitem.id, 
                bookitem.title, 
                bookitem.author,
                bookitem.year,
                bookitem.isComplete,
                iteration
            )
        );
        iteration++;
    }
}

function onBookshelfStateChange(ev) {
    if(!checkStorageAvailability()) return;
    if(alertUnsaved()) return;

    const new_state = (parseInt(localStorage.getItem(BOOKLIST_STATE_STORAGE_KEY)) + 1) % 2;
    const change_state_button_destination_text_element = ev.target.lastElementChild;
    const change_state_button_destination_indicator_element = ev.target.firstElementChild;
    const search_input = document.querySelector("#searchBookTitle");

    change_state_button_destination_text_element.innerHTML = new_state === 0 ? "sudah dibaca" : "belum dibaca";
    change_state_button_destination_indicator_element.src = new_state === 0 ? "assets/goto-complete-bookshelf.svg" : "assets/goto-incomplete-bookshelf.svg";

    search_input.placeholder = new_state === 0 ? "Cari judul di rak Belum dibaca" : "Cari judul di rak Sudah dibaca";

    localStorage.setItem(BOOKLIST_STATE_STORAGE_KEY, String(new_state));
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}

function reduceBookItems(ev, reduce_function) {

    const this_book_id = ev.target.parentElement.parentElement.dataset.bookid;
    const parsed_book_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));
    let iteration = 0;
    for (const id in parsed_book_data) {
        if (id === this_book_id) reduce_function(parsed_book_data, id, iteration);
        ++iteration;
    }

    localStorage.setItem(BOOK_DATA_STORAGE_KEY, JSON.stringify(parsed_book_data));
}
function onBookItemEdited(ev, book_info_wrapper_element) {
    ev.preventDefault();
    
    const book_item_element = book_info_wrapper_element.parentElement;
    const additional_messages = [];

    // custom validation
    const title_input = book_info_wrapper_element.children.item(0);
    if(title_input.value === "") additional_messages.push("<strong>Judul</strong> tidak boleh kosong");
    else if(REGEX_INVALID_CHARSTART.test(title_input.value[0])) additional_messages.push("<strong>Judul</strong> tidak boleh diawali dengan karakter invalid");
    else if(title_input.value.length > MAX_TITLE_CHARS) additional_messages.push(`<strong>Judul</strong> tidak boleh melebihi ${MAX_TITLE_CHARS} karakter`);
    else if(REGEX_INVALID_CHARSET.test(title_input.value)) additional_messages.push("<strong>Judul</strong> tidak boleh mengandung karakter invalid");
    
    const author_input = book_info_wrapper_element.children.item(1).children.item(0);
    if(author_input.value === "") additional_messages.push("<strong>Penulis</strong> tidak boleh kosong");
    else if(REGEX_INVALID_CHARSTART.test(author_input.value[0])) additional_messages.push("<strong>Penulis</strong> tidak boleh diawali dengan karakter invalid");
    else if(author_input.value.length > MAX_TITLE_CHARS) additional_messages.push(`<strong>Penulis</strong> tidak boleh melebihi ${MAX_TITLE_CHARS} karakter`);
    else if(REGEX_INVALID_CHARSET.test(author_input.value)) additional_messages.push("<strong>Penulis</strong> tidak boleh mengandung karakter invalid");
    
    const year_input = book_info_wrapper_element.children.item(1).children.item(1);
    if(year_input.value === "") additional_messages.push("<strong>Tahun</strong> tidak boleh kosong");
    else if(parseInt(year_input.value) < 1) additional_messages.push("<strong>Tahun</strong> tidak boleh dibawah 1");
    else if(parseInt(year_input.value) > new Date().getFullYear()) additional_messages.push("<strong>Tahun</strong> tidak boleh menandakan rilis di masa depan");
    else if((/[^0-9]/g.test(year_input.value))) additional_messages.push("<strong>Tahun</strong> harus mengandung angka yang valid");


    const book_unsaved_indicator = book_info_wrapper_element.lastElementChild;
    book_unsaved_indicator.innerHTML = additional_messages.length > 0 ? `*diubah (${combineStrings(...additional_messages)})` : `*diubah`;
    book_info_wrapper_element.dataset.errcount = additional_messages.length; // set bookitem"s error coun

    const book_save_button = book_info_wrapper_element.parentElement.lastElementChild.children.item(1);
    const book_move_button = book_info_wrapper_element.parentElement.lastElementChild.children.item(0);
    book_save_button.disabled = additional_messages.length > 0;
    book_move_button.disabled = true;
    book_item_element.dataset.unsaved = true;

    updateUnsaved(book_item_element.parentElement);
}
function onBookItemSaved(ev) {
    ev.preventDefault();
    
    const book_option_wrapper_element = ev.target.parentElement;
    const book_item_element = book_option_wrapper_element.parentElement;
    const book_info_wrapper_element = book_item_element.firstElementChild;

    // set properties
    reduceBookItems(ev, (storage_item, storage_index, rendered_index) => {
        storage_item[storage_index].title = book_info_wrapper_element.children.item(0).value;
        RENDERED_BOOKLIST[rendered_index].title = book_info_wrapper_element.children.item(0).value;

        storage_item[storage_index].author = book_info_wrapper_element.children.item(1).children.item(0).value;
        RENDERED_BOOKLIST[rendered_index].author = book_info_wrapper_element.children.item(1).children.item(0).value;

        storage_item[storage_index].year = book_info_wrapper_element.children.item(1).children.item(1).value;
        RENDERED_BOOKLIST[rendered_index].year = book_info_wrapper_element.children.item(1).children.item(1).value;
    });

    const book_unsaved_indicator = book_info_wrapper_element.lastElementChild;
    const book_save_button = book_item_element.lastElementChild.children.item(1);
    const book_move_button = book_item_element.lastElementChild.children.item(0);
    book_unsaved_indicator.innerHTML = "";
    book_save_button.disabled = true;
    book_move_button.disabled = false;
    book_item_element.dataset.unsaved = false;

    updateUnsaved(book_item_element.parentElement);
}
function onBookItemCompleted(ev) {
    ev.preventDefault();
    reduceBookItems(ev, (storage_item, storage_index, rendered_index) => {
        storage_item[storage_index].isComplete = true;
        RENDERED_BOOKLIST[rendered_index].isComplete = true;
    });
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}
function onBookItemIncompleted(ev) {
    ev.preventDefault();
    reduceBookItems(ev, (storage_item, storage_index, rendered_index) => {
        storage_item[storage_index].isComplete = false;
        RENDERED_BOOKLIST[rendered_index].isComplete = false;
    });
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}
function onBookItemDeleted(ev) {
    ev.preventDefault();
    reduceBookItems(ev, (storage_item, storage_index, rendered_index) => {
        delete storage_item[storage_index];
        RENDERED_BOOKLIST.splice(rendered_index, 1);
    });
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}

function renderBooklist(bookshelf) {
    const booklist_state = parseInt(localStorage.getItem(BOOKLIST_STATE_STORAGE_KEY));
    const booklist = bookshelf.children[1];

    
    if(booklist_state === 0) booklist.id = "incompleteBookList";
    else booklist.id = "completeBookList";
    booklist.innerHTML = "";

    let iteration = 0;
    for (const bookitem of RENDERED_BOOKLIST) {

        const display_state = bookitem.isComplete ? 0 : 1;
        if(booklist_state === display_state) continue;

        booklist.appendChild(
            buildBookItemElement(
                bookitem.id, 
                bookitem.title, 
                bookitem.author,
                bookitem.year,
                bookitem.isComplete,
                iteration
            )
        );
        iteration++;
    }
}



// ----------------- FOOTER EVENT HANDLERS -----------------
function updateFooterStats() {

    // Count book stats
    let incompleted_books_count = 0;
    let books_count = 0;
    Object.entries(JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY))).forEach(book =>{
        if (!book[1].isComplete) incompleted_books_count++;
        books_count++;
    });

    // Update stats
    const incompleted_books_stat_number_element = document.querySelector("#incompleted-books-stat").firstElementChild; 
    const completed_books_stat_number_element = document.querySelector("#completed-books-stat").firstElementChild; 
    
    incompleted_books_stat_number_element.innerHTML = incompleted_books_count;
    completed_books_stat_number_element.innerHTML = books_count - incompleted_books_count;
}



// ----------------- GENERAL EVENT HANDLERS -----------------

function rerenderBookContents() {
    const bookshelf = document.getElementById("bookshelf");
    renderBooklist(bookshelf);

    updateFooterStats();
}
function syncBookContents() {
    if(!checkStorageAvailability()) return;
    const parsed_book_data = JSON.parse(localStorage.getItem(BOOK_DATA_STORAGE_KEY));

    // empty cached booklist
    SESSIONDATA.has_unsaved_data = false;
    RENDERED_BOOKLIST.length = 0;

    for(const book_data in parsed_book_data) RENDERED_BOOKLIST.push(parsed_book_data[book_data]);
}

function onDOMContentLoaded() {
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

    syncBookContents();
    document.dispatchEvent(RERENDER_BOOKSHELF_EVENT);
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);


// extra: prevent page quitting when have unsaved edited book item
window.onbeforeunload = () => SESSIONDATA.has_unsaved_data ? "You have unsaved edited book entry(es)" : null;