import React, { useState, useEffect } from 'react';
import './App.css'; // Styling

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFood, setSelectedFood] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [foodNutrients, setFoodNutrients] = useState([]);
    const [loadingNutrients, setLoadingNutrients] = useState(false);
    const [foodLog, setFoodLog] = useState([]);
    const [nutrientCache, setNutrientCache] = useState({});
    const [loadingTotalNutrients, setLoadingTotalNutrients] = useState(false);
    const [userId, setUserId] = useState('guest');

    const removeFromLog = (indexToRemove) => {
        const updatedLog = [...foodLog];
        if (updatedLog[indexToRemove].count > 1) {
            updatedLog[indexToRemove].count -= 1;
        } else {
            updatedLog.splice(indexToRemove, 1);
        }
        setFoodLog(updatedLog);
    };

    useEffect(() => {
        localStorage.setItem('foodLog', JSON.stringify(foodLog));
    }, [foodLog]);

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const query = new URLSearchParams();
                if (searchTerm) query.append('searchString', searchTerm);
                if (selectedCategory && selectedCategory !== "All") query.append('category', selectedCategory);
        
                const res = await fetch(`/api/food?${query}`);
                const data = await res.json();
        
                setFilteredFoods(data);
            } catch (err) {
                console.error(err);
            }
        };        

        fetchFoods();
    }, [searchTerm, selectedCategory]);   

    const categories = ['All', ...new Set(filteredFoods.map(food => food.brandedFoodCategory).filter(Boolean))];

    const calculateTotalNutrients = () => {
        const totals = {};
        foodLog.forEach(entry => {
            const nutrients = nutrientCache[entry.fdcId] || [];
            nutrients.forEach(n => {
                if (!totals[n.nutrientName]) {
                    totals[n.nutrientName] = 0;
                }
                totals[n.nutrientName] += n.amount * entry.count;
            });
        });
        return totals;
    };

    useEffect(() => {
        if (foodLog.length === 0) {
            setLoadingTotalNutrients(false);
            return;
        }
        let allFetched = true;
        foodLog.forEach(entry => {
            if (!nutrientCache[entry.fdcId]) {
                allFetched = false;
            }
        });
        setLoadingTotalNutrients(!allFetched);
    }, [foodLog, nutrientCache]);

    useEffect(() => {
        foodLog.forEach(entry => {
            if (!nutrientCache[entry.fdcId]) {
                fetch(`/api/nutrients/${entry.fdcId}`)
                    .then(res => res.json())
                    .then(data => {
                        setNutrientCache(prev => ({
                            ...prev,
                            [entry.fdcId]: data
                        }));
                    })
                    .catch(err => console.error(err));
            }
        });
    }, []);
    
    useEffect(() => {
        if (!userId.trim()) {
            setFoodLog([]);
            return;
        }
        fetch(`/api/log/${userId}`)
            .then(res => res.json())
            .then(data => setFoodLog(data))
            .catch(err => console.error(err));
    }, [userId]);        

    return (
        <div className="container">
            <h1>Nutribyte</h1>

            <p>
                Current User ID: <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID"
                />
            </p>

            <div className="main">
                <div className="left-panel">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Search for item by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <ul>
                        {filteredFoods.map((food) => (
                            <li key={food.fdcId}>
                                <div className="food-card">
                                    <button
                                        className="description"
                                        onClick={() => {
                                            setSelectedFood(food);
                                            setFoodNutrients([]);
                                            setLoadingNutrients(true);
                                            fetch(`/api/nutrients/${food.fdcId}`)
                                                .then(res => res.json())
                                                .then(data => {setFoodNutrients(data); setLoadingNutrients(false);})
                                                .catch(err => {console.error(err); setLoadingNutrients(false)});
                                        }}
                                    >
                                        <strong>{food.description}</strong><br />
                                        Brand: {food.brandOwner}<br />
                                        Category: {food.brandedFoodCategory}
                                    </button>
                                    <br />
                                    <button onClick={() => {
                                        const existing = foodLog.find(entry => entry.fdcId === food.fdcId);
                                        if (existing) {
                                            const updatedLog = foodLog.map(entry =>
                                                entry.fdcId === food.fdcId
                                                    ? { ...entry, count: entry.count + 1 }
                                                    : entry
                                            );
                                            setFoodLog(updatedLog);
                                        } else {
                                            setFoodLog([...foodLog, { fdcId: food.fdcId, count: 1 }]);
                                        }
                                        if (!nutrientCache[food.fdcId]) {
                                            fetch(`/api/nutrients/${food.fdcId}`)
                                                .then(res => res.json())
                                                .then(data => {
                                                    setNutrientCache(prev => ({
                                                        ...prev,
                                                        [food.fdcId]: data
                                                    }));
                                                })
                                                .catch(err => console.error(err));
                                        }
                                    }}>
                                        Add to Log
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="right-panel">
                    {foodLog.length > 0 && (
                        <div>
                            <h2>Daily Food Log</h2>
                            <button
                                onClick={() => {
                                    fetch(`/api/log/${userId}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(foodLog)
                                    })
                                    .then(res => {
                                        if (res.ok) alert("Log saved!");
                                        else alert("Error saving log.");
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        alert("Error saving log.");
                                    });
                                }}
                            >
                                Save Log to Server
                            </button>
                            <ul>
                                {foodLog.map((item, index) => {
                                    const food = filteredFoods.find(f => f.fdcId === item.fdcId);
                                    return (
                                        <li key={index}>
                                            {food?.description || item.fdcId} x {item.count}
                                            <button className="delete" onClick={() => removeFromLog(index)}>Delete</button>
                                        </li>
                                    );
                                })}
                            </ul>
                            <button onClick={() => setFoodLog([])}>Clear Log</button>

                            <h3>Total Nutrients</h3>
                            {loadingTotalNutrients && <p>Loading total nutrients…</p>}
                            {!loadingTotalNutrients && (
                                <ul>
                                    {Object.entries(calculateTotalNutrients()).map(([name, total]) => (
                                        <li key={name}>
                                            {name}: {total.toFixed(1)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <hr className="divider" />

                    {selectedFood && (
                        <div>
                            <h2>Details:</h2>
                            <p><strong>Ingredients:</strong> {selectedFood.ingredients}</p>
                            <p><strong>Serving Size:</strong> {selectedFood.servingSize} {selectedFood.servingSizeUnit}</p>
                            <p><strong>Category:</strong> {selectedFood.brandedFoodCategory}</p>

                            <h3>Nutrients:</h3>
                            {loadingNutrients && <p>Loading nutrients…</p>}
                            <ul>
                            {foodNutrients.map(n => (
                                <li key={n.nutrientId}>{n.nutrientName}: {n.amount} {n.nutrientUnit}</li>
                            ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
