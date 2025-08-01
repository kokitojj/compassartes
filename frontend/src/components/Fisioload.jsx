import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createWellnessEntry, listMyWellnessEntries } from '../actions/fisioloadActions';
import { WELLNESS_ENTRY_CREATE_RESET } from '../constants/fisioloadConstants';

const Fisioload = () => {
    const [sessionType, setSessionType] = useState('practice');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [fatiguePre, setFatiguePre] = useState(5);
    const [sleepQuality, setSleepQuality] = useState(5);
    const [sleepHours, setSleepHours] = useState('');
    const [stressLevel, setStressLevel] = useState(5);
    const [mood, setMood] = useState(5);
    const [muscleSoreness, setMuscleSoreness] = useState(5);
    const [injuryPain, setInjuryPain] = useState(0);
    const [menstrualPeriod, setMenstrualPeriod] = useState(false);
    const [nutritionQuality, setNutritionQuality] = useState(5);
    const [fatiguePost, setFatiguePost] = useState(5);
    const [rpe, setRpe] = useState(5);
    const [comments, setComments] = useState('');

    const dispatch = useDispatch();

    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const userInfoFromStorage = localStorage.getItem('compassart-user')
            ? JSON.parse(localStorage.getItem('compassart-user'))
            : null;
        setUserInfo(userInfoFromStorage);
        console.log("UserInfo from localStorage:", userInfoFromStorage);
    }, []);

    const wellnessEntryCreate = useSelector((state) => state.wellnessEntryCreate);
    const { success: successCreate, error: errorCreate } = wellnessEntryCreate;

    const wellnessEntryListMy = useSelector((state) => state.wellnessEntryListMy);
    const { loading: loadingEntries, error: errorEntries, entries } = wellnessEntryListMy;

    useEffect(() => {
        if (successCreate) {
            alert('Wellness Entry Submitted!');
            dispatch({ type: WELLNESS_ENTRY_CREATE_RESET });
            setSessionType('practice');
            setDurationMinutes('');
            setFatiguePre(5);
            setSleepQuality(5);
            setSleepHours('');
            setStressLevel(5);
            setMood(5);
            setMuscleSoreness(5);
            setInjuryPain(0);
            setMenstrualPeriod(false);
            setNutritionQuality(5);
            setFatiguePost(5);
            setRpe(5);
            setComments('');
        }
        // Solo despachar listMyWellnessEntries si userInfo está disponible
        if (userInfo) {
            dispatch(listMyWellnessEntries());
        }
    }, [dispatch, successCreate, userInfo]);

    const submitHandler = (e) => {
        e.preventDefault();
        if (!userInfo) {
            alert('Debes iniciar sesión para enviar una entrada de wellness.');
            return;
        }
        dispatch(createWellnessEntry({ 
            session_type: sessionType, 
            duration_minutes: durationMinutes, 
            fatigue_pre: fatiguePre, 
            sleep_quality: sleepQuality, 
            sleep_hours: sleepHours, 
            stress_level: stressLevel, 
            mood: mood, 
            muscle_soreness: muscleSoreness, 
            injury_pain: injuryPain, 
            menstrual_period: menstrualPeriod, 
            nutrition_quality: nutritionQuality, 
            fatigue_post: fatiguePost, 
            rpe: rpe, 
            comments: comments 
        }));
    };

    // Mostrar un mensaje de carga si userInfo no está disponible
    if (!userInfo) {
        return <div className="container mx-auto p-4"><p>Cargando información de usuario...</p></div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-2xl mx-auto bg-backblue p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">Fisioload <span className='text-primary'> Wellness Entry</span></h1>
                {errorCreate && <p className="text-red-500 text-center mb-4">{errorCreate}</p>}
                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label htmlFor="sessionType" className="block text-primary text-sm font-bold mb-2">Session Type</label>
                        <select
                            id="sessionType"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={sessionType}
                            onChange={(e) => setSessionType(e.target.value)}
                        >
                            <option value='practice'>Practice</option>
                            <option value='game'>Game</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="durationMinutes" className="block text-primary text-sm font-bold mb-2">Duration (minutes)</label>
                        <input
                            type='number'
                            id="durationMinutes"
                            placeholder='Enter duration in minutes'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="fatiguePre" className="block text-primary text-sm font-bold mb-2">Fatigue Pre-Session (1-10)</label>
                        <input
                            type='number'
                            id="fatiguePre"
                            placeholder='Enter fatigue level'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={fatiguePre}
                            onChange={(e) => setFatiguePre(e.target.value)}
                            min='1'
                            max='10'
                        />
                    </div>

                    <div>
                        <label htmlFor="sleepQuality" className="block text-primary text-sm font-bold mb-2">Sleep Quality (1-10)</label>
                        <input
                            type='number'
                            id="sleepQuality"
                            placeholder='Enter sleep quality'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={sleepQuality}
                            onChange={(e) => setSleepQuality(e.target.value)}
                            min='1'
                            max='10'
                        />
                    </div>

                    <div>
                        <label htmlFor="sleepHours" className="block text-primary text-sm font-bold mb-2">Sleep Hours</label>
                        <input
                            type='number'
                            id="sleepHours"
                            step='0.1'
                            placeholder='Enter sleep hours'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={sleepHours}
                            onChange={(e) => setSleepHours(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="stressLevel" className="block text-primary text-sm font-bold mb-2">Stress Level (1-10)</label>
                        <input
                            type='number'
                            id="stressLevel"
                            placeholder='Enter stress level'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={stressLevel}
                            onChange={(e) => setStressLevel(e.target.value)}
                            min='1'
                            max='10'
                        />
                    </div>

                    <div>
                        <label htmlFor="mood" className="block text-primary text-sm font-bold mb-2">Mood (1-10)</label>
                        <input
                            type='number'
                            id="mood"
                            placeholder='Enter mood level'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            min='1'
                            max='10'
                        />
                    </div>

                    <div>
                        <label htmlFor="muscleSoreness" className="block text-primary text-sm font-bold mb-2">Muscle Soreness (1-10)</label>
                        <input
                            type='number'
                            id="muscleSoreness"
                            placeholder='Enter muscle soreness level'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={muscleSoreness}
                            onChange={(e) => setMuscleSoreness(e.target.value)}
                            min='1'
                            max='10'
                        />
                    </div>

                    <div>
                        <label htmlFor="injuryPain" className="block text-primary text-sm font-bold mb-2">Injury Pain (0-10)</label>
                        <input
                            type='number'
                            id="injuryPain"
                            placeholder='Enter injury pain level'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={injuryPain}
                            onChange={(e) => setInjuryPain(e.target.value)}
                            min='0'
                            max='10'
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <input
                            type='checkbox'
                            id="menstrualPeriod"
                            className="mr-2 leading-tight"
                            checked={menstrualPeriod}
                            onChange={(e) => setMenstrualPeriod(e.target.checked)}
                        />
                        <label htmlFor="menstrualPeriod" className="text-primary text-sm font-bold">Menstrual Period</label>
                    </div>

                    <div>
                        <label htmlFor="nutritionQuality" className="block text-gray-700 text-sm font-bold mb-2">Nutrition Quality (1-10)</label>
                        <input
                            type='number'
                            id="nutritionQuality"
                            placeholder='Enter nutrition quality'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={nutritionQuality}
                            onChange={(e) => setNutritionQuality(e.target.value)}
                            min='1'
                            max='10'
                        />
                    </div>

                    <div>
                        <label htmlFor="fatiguePost" className="block text-primary text-sm font-bold mb-2">Fatigue Post-Session (1-10)</label>
                        <input
                            type='number'
                            id="fatiguePost"
                            placeholder='Enter post-session fatigue'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={fatiguePost}
                            onChange={(e) => setFatiguePost(e.target.value)}
                            min='1'
                            max='10'
                        />
                    </div>

                    <div>
                        <label htmlFor="rpe" className="block text-primary text-sm font-bold mb-2">RPE (Rate of Perceived Exertion) (0-10)</label>
                        <input
                            type='number'
                            id="rpe"
                            placeholder='Enter RPE'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={rpe}
                            onChange={(e) => setRpe(e.target.value)}
                            min='0'
                            max='10'
                        />
                    </div>

                    <div>
                        <label htmlFor="comments" className="block text-primary text-sm font-bold mb-2">Comments</label>
                        <textarea
                            id="comments"
                            rows={3}
                            placeholder='Any additional comments'
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        type='submit'
                        className="bg-green-500 hover:bg-primary text-backblue font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    >
                        Submit Entry
                    </button>
                </form>

                <h2 className="text-2xl font-bold text-white mt-8 mb-4 text-center">My Wellness Entries</h2>
                {loadingEntries ? (
                    <p className="text-center">Loading entries...</p>
                ) : errorEntries ? (
                    <p className="text-red-500 text-center">{errorEntries}</p>
                ) : entries && entries.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {entries.map((entry) => (
                            <li key={entry.id} className="py-4">
                                <p><strong>Date:</strong> {new Date(entry.created_at).toLocaleDateString()}</p>
                                <p><strong>Session Type:</strong> {entry.session_type}</p>
                                <p><strong>Duration:</strong> {entry.duration_minutes} min</p>
                                {/* You can add more details here */}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center">No wellness entries found.</p>
                )}
            </div>
        </div>
    );
};

export default Fisioload;