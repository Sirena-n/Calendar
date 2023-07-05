import axios from 'axios';
import React, { useState, useEffect } from 'react';


import './ContributionGraph.scss'; 

const ContributionGraph = () => {
    const dataUrl = 'https://dpg.gg/test/calendar.json';
    const [calendarData, setCalendarData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(dataUrl);
                setCalendarData(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, []);

    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 51 * 7);

    const monthsArray = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        const day = date.getDate();

        const monthObject = monthsArray.find((m) => m.year === year && m.month === month);

        if (monthObject) {
            monthObject.days.push({
                date: `${year}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
                contributions: calendarData[`${year}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`] || 0,
            });
        } else {
            monthsArray.push({
                year: year,
                month: month,
                days: [{
                    date: `${year}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
                    contributions: calendarData[`${year}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`] || 0,
                }],
            });
        }
    }

    const daysList = monthsArray.flatMap((month) => month.days.map((day) => day.date));

    const calendarList = Object.keys(calendarData);

    function getSquareColor(contributions) {
        if (contributions === 0) {
            return "#EDEDED";
        } else if (contributions >= 1 && contributions <= 9) {
            return "#ACD5F2";
        } else if (contributions >= 10 && contributions <= 19) {
            return "#7FA8C9";
        } else if (contributions >= 20 && contributions <= 29) {
            return "#527BA0";
        } else {
            return "#254E77";
        }
    }

    const [selectedSquare, setSelectedSquare] = useState(null);

    function handleSquareClick(day, contributions) {
        if (selectedSquare && selectedSquare.date === day) {
            setSelectedSquare(null);
        } else {
            setSelectedSquare({
                date: day,
                contributions: contributions
            });
        }
    }

    function formatDate(dateString) {
        const options = {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        };

        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", options);
    }

    function getDayOfWeek(dateString) {
        const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
        const date = new Date(dateString);
        const dayOfWeekIndex = date.getDay();
        return daysOfWeek[dayOfWeekIndex];
    }

    function compareArrays(daysList, calendarList, calendarData) {
        const comparedItems = [];

        for (let i = 0; i < daysList.length; i += 7) {
            const divContents = daysList.slice(i, i + 7).map((day, index) => {
                const calendarIndex = calendarList.indexOf(day);
                const contributions = calendarIndex !== -1 ? calendarData[calendarList[calendarIndex]] : 0;
                const squareColor = getSquareColor(contributions);
                const isSelected = selectedSquare && selectedSquare.date === day;
                const formattedDate = formatDate(day);
                const dayOfWeek = getDayOfWeek(day);

                return (
                    <li
                        key={index}
                        className={`day${isSelected ? ' selected' : ''}`}
                        style={{ backgroundColor: squareColor }}
                        onClick={() => handleSquareClick(day, contributions)}
                    >
                        {isSelected && (
                            <div className='infAccordion'>
                                <p>Date: {formattedDate}</p>
                                <p>Day of Week: {dayOfWeek}</p>
                                <p>Contributions: {contributions}</p>
                            </div>
                        )}
                    </li>
                );
            });

            const lastElement = divContents.pop();
            const secondLastElement = divContents.pop();
            divContents.unshift(secondLastElement);
            divContents.unshift(lastElement);

            const temp = divContents[0]
            divContents[0] = divContents[1]
            divContents[1] = temp

            comparedItems.push(<div key={i}>{divContents}</div>);
        }

        return comparedItems;
    }

    const comparedItems = compareArrays(daysList, calendarList, calendarData);


    return (
        <div className='calendarWrapper'>
            <ul className='calendar'>
                <ul className='month'>
                    <li></li>
                    {
                        monthsArray.map(data => (
                            <li>{data.month}</li>
                        ))
                    }
                </ul>
                <ul className='weekdays'>
                    <li className='dayInWeek'>Пн</li>
                    <li className='dayInWeek'>Ср</li>
                    <li className='dayInWeek'>Пт</li>
                </ul>
                {comparedItems}
            </ul>
        </div>
    );
};

export default ContributionGraph;