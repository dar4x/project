//? АПИ для запросов
const API = "http://localhost:8000/products";

//? блок куда мы добавляем карточки
const list = document.querySelector("#products-list");

//? форма с инпутами для ввода данных
const addForm = document.querySelector("#add-form");
const titleInp = document.querySelector("#title");
const priceInp = document.querySelector("#price");
const descriptionInp = document.querySelector("#description");
const imageInp = document.querySelector("#image");

// ? инпуты и кнопка из модалки

const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-descr");
const editImageInp = document.querySelector("#edit-image");
const editSaveBtn = document.querySelector("#btn-save-edit");

// ? инпут для поиска
const searchInput = document.querySelector("#search");

// ?переменная по которой делаем запрос на поиск
let searchVal = "";

// ? то где отображаем кнопки для пагинации
const paginationList = document.querySelector(".pagination-list");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
// ? максимальное количество продуктов на одной странице
const limit = 3;
// ? текущая страница
let currentPage = 1;
// ? общее количество страниц
let pageTotalCount = 1;

// ? первоначальное отображение данных
getProducts();

//? это функция для получения данных
async function getProducts() {
  const res = await fetch(
    `${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}`
    // ? title like для поиска по ключу title
    // ? q для поиска по всем ключам
    // ? _limit для того чтобы указать максимальное количество элементов на одной странице
    // ? _page чтобы получить данные на определенной странице
  );
  const count = res.headers.get("x-total-count"); // ? x-total-count общее количество продуктов
  // ? формула чтобы вычислить максимальное число продуктов
  pageTotalCount = Math.ceil(count / limit);
  const data = await res.json(); //? расшифровка данных
  //? отображаем актуальные данные
  render(data);
}

//? функция для добавления в db.json
async function addProduct(product) {
  //? await для того чтобы getProducts подождала пока данные добавяться
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(product),
    headers: {
      "Content-Type": "application/json",
    },
  });
  //? стянуть и отобразить акутльные данные
  getProducts();
}

// ? функция для удаления из db.json
async function deleteProduct(id) {
  // ? await для того чтобы getProducts подождал пока данные удалятся
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  // ? стянуть и отобразить актуальные данные
  getProducts();
}

// ? функция для получения одного продукта
async function getOneProduct(id) {
  const res = await fetch(`${API}/${id}`); // ? расшифровка данных
  const data = await res.json(); // ? расшифровка данных
  return data; // ? возвращаем продукт с db.json
}

// ? функия чтобы изменить данные
async function editProduct(id, editedProduct) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editedProduct),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getProducts();
}

//? это функция для отоброжение на странице
function render(arr) {
  //? чтобы наши карточки не дублировались
  list.innerHTML = "";
  arr.forEach((item) => {
    list.innerHTML += `<div class="card m-5" style="width: 18rem">
    <img
      src="${item.image}"
      class="card-img-top w-100"
      alt="..."
    />
    <div class="card-body">
      <h5 class="card-title">${item.title}</h5>
      <p class="card-text">${item.description.slice(0, 70)}...</p>
      <p class="card-text">$ ${item.price}</p>
      <button data-bs-toggle="modal" data-bs-target="#exampleModal" id="${
        item.id
      }" class="btn btn-dark btn-edit">EDIT</button>
      <button  id="${item.id}" class="btn btn-danger btn-delete">DELETE</button>
    </div>
  </div>`;
  });
  renderPagination();
}

//? вешаем обработчик события для добавления (CREATE)
addForm.addEventListener("submit", (e) => {
  //? чтобы страница не перезагружалась
  e.preventDefault();

  //? проверка на заполненность полей
  if (
    !titleInp.value.trim() ||
    !priceInp.value.trim() ||
    !descriptionInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  //? создаем обьект для отправки в db.json
  const product = {
    title: titleInp.value,
    price: priceInp.value,
    description: descriptionInp.value,
    image: imageInp.value,
  };

  //? отправляем данные в db.json
  addProduct(product);

  //? очищаем инпуты
  titleInp.value = "";
  priceInp.value = "";
  descriptionInp.value = "";
  imageInp.value = "";
});

// ? прослушка для опознования клика на кнопку delete
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteProduct(e.target.id);
  }
});

// ? переменная чтобы сохранить айди продукта на который мы нажали
let id = null;

// ? отслеживаем клик на открытия и заполнения модалки
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    // ? сохраняем id продукта
    id = e.target.id;
    // ? получаем объект продукта на который мы нажали
    // ? поставили await потому что getOneProduct асинхронная функция
    const product = await getOneProduct(e.target.id);

    // ? подставляем значения под инпуты нашей модалки данными продукта
    editTitleInp.value = product.title;
    editPriceInp.value = product.price;
    editDescriptionInp.value = product.description;
    editImageInp.value = product.image;
  }
});

// ? обработчик события на сохранение данных
editSaveBtn.addEventListener("click", (e) => {
  // ? проверка на пустые поля
  if (
    !editTitleInp.value.trim() ||
    !editDescriptionInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("Заполните поля");
    // ? если хотя бы один инпут пустой выводим предупреждение и останавливаем функцию
    return;
  }

  // ? собираем изменненый объект для отправки новых значений в db.json
  const editedProduct = {
    title: editTitleInp.value,
    description: editDescriptionInp.value,
    image: editImageInp.value,
    price: editPriceInp.value,
  };

  // ? вызываем функцию для изменения
  editProduct(id, editedProduct);
});

// git

// ? обработчик события для поиска
searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;
  currentPage = 1;
  getProducts();
});

// ? отображение кнопок пагинации
function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `<li class="page-item ${
      currentPage == i ? "active" : ""
    }">
    <a href="#" class="page-link page_number">${i}</a>
  </li>`;
  }

  // ? чтобы кнопка prev была неактивна на первой странице
  if (currentPage == 1) {
    prev.classList.add("disabled");
  } else {
    prev.classList.remove("disabled");
  }
  // ? чтобы кнопка next была неактивна на последней странице
  if (currentPage == pageTotalCount) {
    next.classList.add("disabled");
  } else {
    next.classList.remove("disabled");
  }
}

// ? обработчик события чтобы перейти на определенную сираницу
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    console.log(e.target.innerText);
    getProducts();
  }
});

// ? обработчик события чтобы перейти на следующую страницу
next.addEventListener("click", () => {
  if (currentPage == pageTotalCount) {
    return;
  }

  currentPage++;
  getProducts();
});

// ? обработчик события чтобы перейти на предыдущую страницу
prev.addEventListener("click", (e) => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  getProducts();
});

console.log("some changes");

console.log("new branch");
