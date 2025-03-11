function initApp() {

    const selectCategories = document.querySelector('#categorias');
    selectCategories.addEventListener('change', selectCategory)

    getCategories();

    function getCategories() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
        fetch( url )
            .then( res => res.json() )
            .then( showCategories )
    }

    function showCategories({ categories = [] }) {
        categories.forEach( category => {

            const { strCategory } = category;
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategories.appendChild( option );
        });
    }

    function selectCategory( e ) {
        const category = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${ category }`;

        fetch( url )
            .then( res => res.json() )
            .then( showRecipes )
    }

    function showRecipes({ meals = [] }) {
        // iterate in result
        meals.forEach( recipe => {

            const { strMeal, strMealThumb, idMeal } = recipe;

            const recipeContainer = document.createElement('DIV');
            recipeContainer.classList.add('col-md-4');

            recipeCard = document.createElement('DIV');
            recipeCard.classList.add('card', 'mb-4');

            const recipeImage = document.createElement('IMG');
            recipeImage.classList.add('card-img-top');
            recipeImage.alt = ` Imagen de la receta ${ strMeal }`
            recipeImage.src = strMealThumb

            const recipeCardBody = document.createElement('DIV');
            recipeCardBody.classList.add('card-body');

        });
    }
}

document.addEventListener('DOMContentLoaded', initApp());