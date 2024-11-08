import React, { useState } from 'react';
import arrow from './images/arrow.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import './Plan.css';

const url = process.env.NODE_ENV === 'production' ? 'https://mealplanner-is1t.onrender.com/' :  'http://127.0.0.1:8000/';

const recipeColors = {
  0: 'bg-[#FAF1C0]', // light yellow
  1: 'bg-[#C9E4DE]', // light green
  2: 'bg-[#C6DEF1]', // light blue
};

const extractRecipeData = (plan) => {
  const recipesData = {};
  Object.keys(plan.plan).forEach(day => {
    const breakfast = plan.plan[day].breakfast;
    const lunch = plan.plan[day].lunch;
    const dinner = plan.plan[day].dinner;
    recipesData[day] = [breakfast, lunch, dinner];
  });
  return recipesData;
};

const extractNutritionData = (plan) => {
  const nutritionData = {};
  Object.keys(plan.plan).forEach(day => {
    const nutrition = plan.plan[day].nutrition;
    if (nutrition) {
      const {calories, sodium, fat, protein} = nutrition;
      nutritionData[day] = {
        calories: calories,
        sodium: `${sodium}mg`,
        fat: `${fat}g`,
        protein: `${protein}g`
      };
    } else {
      nutritionData[day] = { 
        calories: 0, 
        sodium: 0, 
        fat: 0, 
        protein: 0 
      };
    }
  });
  return nutritionData;
};

function getCurrentWeekDates() {
  const today = new Date();
  const sunday = new Date(today.setDate(today.getDate() - today.getDay()));
  const dates = Array.from({ length: 7 }, (_, i) => {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    return nextDate;
  });
  return dates;
}

function formatDate(date) {
  const options = { month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

function Plan() {
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const planData = location.state?.planData;
  const nutritionData = extractNutritionData(planData);
  const recipesData = extractRecipeData(planData);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const weekDates = getCurrentWeekDates();
  const startDate = weekDates[0];
  const endDate = weekDates[weekDates.length - 1];
  const title = `Meal Plan for ${formatDate(startDate)} - ${formatDate(endDate)}`;
  const navigate = useNavigate();

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );

  const handleRecipeClick = (recipe, recipeIndex) => {
    const recipeKey = `${recipe.meal}-${recipeIndex}`;
  
    const storedRecipe = localStorage.getItem(recipeKey);
  
    if (storedRecipe) {
      const parsedRecipe = JSON.parse(storedRecipe);
      navigate('/recipe', { 
        state: { 
          recipe, 
          generatedRecipe: parsedRecipe.details, 
          image_url: parsedRecipe.image_url, 
          colorIndex: recipeIndex 
        }
      });
    } else {
      setLoading(true);
      fetch(`${url}get_recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal: recipe.meal,
          description: recipe.description,
        })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Generated Recipe:', data);
          localStorage.setItem(recipeKey, JSON.stringify(data));
          navigate('/recipe', { 
            state: { 
              recipe, 
              generatedRecipe: data.details, 
              image_url: data.image_url, 
              colorIndex: recipeIndex 
            }
          });
        })
        .finally(() => {
          setLoading(false);
        });
      console.log('Clicked Recipe:', recipe);
    }
  };

  return (

    
    <div className="p-4">
      {loading ? (
          <div className="loading-screen">
            <LoadingSpinner />
          </div>
        ) : (
          <>
          <h2 className="text-4xl font-semibold mt-8 mb-16 text-center ">{title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 mx-10">
            {planData && Object.keys(recipesData).map((day, index) => (
              <div
                key={day}
                className="relative border-2 border-gray-300 rounded-3xl p-4 shadow-md h-[580px] pb-24 overflow-hidden flex flex-col"
              >
                <h3 className="text-xl font-medium text-center">{day}</h3>
                <p className="text-center text-gray-600 mb-6">{formatDate(weekDates[index])}</p>
    
                <div
                  className={`space-y-10 transition-all duration-300 flex-grow flex flex-col justify-between ${
                    hoveredInfo === day ? 'hidden' : 'block'
                  } scrollable`}
                >
                  {recipesData[day].map((recipe, recipeIndex) => (
                    <button
                      key={recipeIndex}
                      className={`${recipeColors[recipeIndex]} text-black text-sm font-medium border border-gray-400 p-2 rounded-3xl w-full flex-grow`}
                      onClick={() => handleRecipeClick(recipe, recipeIndex)}
                    >
                      {recipe.meal}
                      {/*<hr className="stylized-hr" />
                      <div>{recipe.description}</div>*/}
                    </button>
                  ))}
                </div>
    
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-gray-200 text-gray-600 cursor-pointer p-2 transition-all duration-300 ${
                    hoveredInfo === day ? 'h-[490px]' : 'h-16'
                  }`}
                  onMouseEnter={() => setHoveredInfo(day)}
                  onMouseLeave={() => setHoveredInfo(null)} 
                  style={{ transition: 'height 0.3s ease-in-out'}}
                >
                  {hoveredInfo === day ? (
                    <div className="text-center text-black">
                      <h4 className="text-md font-bold my-2">Nutritional Content</h4>
                      <p>Calories: {nutritionData[day].calories}</p>
                      <p>Sodium: {nutritionData[day].sodium}</p>
                      <p>Fat: {nutritionData[day].fat}</p>
                      <p>Protein: {nutritionData[day].protein}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-0">
                      <img src={arrow} alt="Arrow" className="" />
                      <p>More Info</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          </>
        )
      }
    </div>
  );
}

export default Plan;
