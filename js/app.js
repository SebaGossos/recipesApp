function initApp() {

    const selectCategories = document.querySelector('#categorias');
    selectCategories.addEventListener('change', selectCategory);

    // selectors
    const result = document.querySelector('#resultado');

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
        
        cleanHtml( result );

        // iterate in result
        meals.forEach( recipe => {

            const { strMeal, strMealThumb, idMeal } = recipe;

            const recipeContainer = document.createElement('DIV');
            recipeContainer.classList.add('col-md-4');

            const recipeCard = document.createElement('DIV');
            recipeCard.classList.add('card', 'mb-4');

            const recipeImage = document.createElement('IMG');
            recipeImage.classList.add('card-img-top');
            recipeImage.alt = ` Imagen de la receta ${ strMeal }`
            recipeImage.src = strMealThumb

            const recipeCardBody = document.createElement('DIV');
            recipeCardBody.classList.add('card-body');

            const recipeHeading = document.createElement('H3');
            recipeHeading.classList.add('card-title', 'mb-3');
            recipeHeading.textContent = strMeal;

            const recipeBtn = document.createElement('BUTTON');
            recipeBtn.classList.add('btn', 'btn-danger', 'w-100');
            recipeBtn.textContent = 'Mostrar Receta';

            
            /* 
            .result
                recipeConteiner
                    .card 
                        img
                        .card-body
                            h3
                            button 
            */
            recipeCardBody.appendChild( recipeHeading );
            recipeCardBody.appendChild( recipeBtn );

            recipeCard.appendChild( recipeImage );
            recipeCard.appendChild( recipeCardBody );
            
            recipeContainer.appendChild( recipeCard );

            result.appendChild( recipeContainer );

        });
    }

    function cleanHtml( selector ) {
        while( selector.firstChild ) {
            selector.removeChild( selector.firstChild );
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp());