function initApp() {

    const selectCategories = document.querySelector('#categorias');
    selectCategories.addEventListener('change', selectCategory);

    // selectors
    const result = document.querySelector('#resultado');
    const modal = new bootstrap.Modal('#modal', {});

    // localStorage
    const getFavorites = () => JSON.parse( localStorage.getItem('favorites') ) ?? [];  
    
    
    
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

        
        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = meals?.length ? 'Resultados' : 'No hay resultados';
        result.appendChild( heading );
        

        // iterate in result
        meals?.forEach( recipe => {

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
            // recipeBtn.dataset.bsTarget = "#modal";
            // recipeBtn.dataset.bsToggle = "modal";
            recipeBtn.onclick = function() {
                selectRecipe( idMeal );
            }

            
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

    function selectRecipe( id ) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${ id }`;
        fetch( url )
            .then(res => res.json())
            .then( res => showRecipeModal( res.meals[0] ))
    }

    function showRecipeModal( recipe ) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;
        
        
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');


        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img  clas="img-fluid" width=450 src="${ strMealThumb }" alt="recipe ${ strMeal }" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${ strInstructions }</p>
            <h3 class="my-3">Ingredientes y Cantidades<h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        // show quantity and ingredients
        for (let i = 1; i <= 20; i++ ) {
            if ( recipe[`strIngredient${ i }`] ) {
                const ingredient = recipe[`strIngredient${ i }`];
                const quantity = recipe[`strMeasure${ i }`];

                const ingredientLi = document.createElement('LI');
                ingredientLi.classList.add('list-group-item')
                ingredientLi.textContent = `${ ingredient } - ${ quantity }`;

                listGroup.appendChild( ingredientLi );
            }
        }

        modalBody.appendChild( listGroup );

        const modalFooter = document.querySelector('.modal-footer');
        cleanHtml( modalFooter );

        // botons to close and favorite
        const btnFavorite = document.createElement('BUTTON');
        btnFavorite.classList.add('btn', 'btn-danger', 'col');
        btnFavorite.textContent = 'Guardar Favorito';
        

        // localStorage 

        //--------------------------------------------

        
        const favorites = getFavorites();
        function wasDeleted(isAdded) {
            if ( isAdded === false ){
                btnFavorite.textContent = 'Eliminar Favorito';
                btnFavorite.onclick = () => deleteFavorite( idMeal, wasDeleted );
                return;
            }
            btnFavorite.textContent = 'Guardar Favorito';
            btnFavorite.onclick = () => addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            }, wasDeleted);

            return;
        }
        if( isRecipeinLocalStorage( favorites, idMeal ) ) {
            btnFavorite.textContent = 'Eliminar Favorito';
            btnFavorite.onclick = () => deleteFavorite( idMeal, wasDeleted );
        } else {
            btnFavorite.onclick = () => addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            }, wasDeleted);
        }
        //--------------------------------------------  



        const btnCloseModal = document.createElement('BUTTON');
        btnCloseModal.classList.add('btn', 'btn-secondary', 'col');
        btnCloseModal.textContent = 'Cerrar';
        btnCloseModal.onclick = () => modal.hide();

        
        modalFooter.appendChild( btnCloseModal );
        modalFooter.appendChild( btnFavorite );
        
        // showModal
        modal.show();
        
    }

    function addFavorite( recipe, callback ) {
        const favorites = getFavorites();
        if( isRecipeinLocalStorage( favorites, recipe.id ) ) return;
        localStorage.setItem('favorites', JSON.stringify([...favorites, recipe ]));
        callback(false);
    }
    
    function deleteFavorite( id, callback ) {
        const favorites = getFavorites();
        const newFavorites = favorites.filter( item => item.id !== id );
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        callback(true);
    }

    function isRecipeinLocalStorage( favorites, id ) {
        if( favorites.some(item => item.id === id ) ) return true; // didn´t added to localStorage
        return false 
    }


    function cleanHtml( selector ) {
        while( selector.firstChild ) {
            selector.removeChild( selector.firstChild );
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp());