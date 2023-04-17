// CSS File Import
import './css/styles.css';

// Image Imports
import './images/Activity_Logo.svg';
import './images/Hydration_Logo.svg';
import './images/Sleep_Logo.svg';
import './images/Site_Logo.svg';

// Classes Imports
import UserRepository from './classes/UserRepository';
import Hydration from './classes/Hydration';
import Sleep from './classes/Sleep';
import Activity from './classes/Activity';

// 3rd party library import
import Chart from 'chart.js/auto';
import dayjs from 'dayjs';
import L from 'leaflet';
import MicroModal from "micromodal";
MicroModal.init();

// Import API Calls
import './apiCalls';
import {
  fetchUsers,
  fetchHydration,
  fetchSleep,
  fetchActivity,
  fetchMap
} from "./apiCalls";

// Global variables
let user;
let userBase;
let hydration;
let activity;
let sleep;
let date = dayjs().format("YYYY/MM/DD");

// Fetch Requests
Promise.all([fetchUsers(), fetchHydration(), fetchSleep(), fetchActivity()])
  .then(([userData, hydrationData, sleepData, activityData]) => {
    userBase = new UserRepository(userData.users);
    user = userBase.getRandomUser();
    displayUserCard(user);
    displayStepUserVsAllUsers(user, userBase);
    displayUserGreeting(user, date);
    displayFriendsList(user, userBase);
    displayUserCardInitial(user);

    hydration = new Hydration(hydrationData.hydrationData);
    displayhydrationCard(hydration, user.id, date);

    sleep = new Sleep(sleepData.sleepData);

    displaySleepCard(sleep, user.id, date);

    activity = new Activity(activityData.activityData);
    displayActivityCard(activity, user, date, user.id);
  })
  .catch((error) => {
    alert("Error fetching data:" + error);
  });

//Query Selectors
const hydrationCard = document.querySelector(".hydration-holder");
const hydrationOpenButton = document.querySelector("#hydrationOpenButton");
const form = document.getElementById('form');
hydrationOpenButton.addEventListener("click", displayModal);

// DOM Manipulation Functions
const displayUserCard = (user) => {
  const userCard = document.querySelector('.user-profile-info-js');
  userCard.innerHTML = `
    <p class="bold-text">Name</p> 
    <p>${user.name}</p>
    <p class="bold-text">Address</p> 
    <p>${user.address}</p>
    <p class="bold-text">Email</p> 
    <p>${user.email}</p>
  `;
};

// User Functions
const displayUserCardInitial = (user) => {
  const userCardName = document.querySelector('.user-card-name-js');
  const userInitial = user.getFirstName().charAt(0);
  userCardName.innerText = `${userInitial}`;
};

const displayStepUserVsAllUsers = (user, userBase) => {
  const stepUserVsAllUsers = document.querySelector('.user-steps-vs-all-js');
  stepUserVsAllUsers.innerHTML = `
    <p class="bold-text">Your Stride Length</p>
    <p>${user.strideLength}</p>
    <p class="bold-text">Your Step Goal</p> 
    <p>${user.dailyStepGoal}</p>
    <p class="bold-text">Average User Step Goal</p> 
    <p>${userBase.calculateAverageStepGoal()}</p>
  `;
};

const displayFriendsList = (user, userBase) => {
  const friendsList = document.querySelector('.user-friends-js');
  let userFriends = userBase.returnUserFriendsName(user.id);
  friendsList.innerHTML = `
    <p class="bold-text">Friends</p>
    <p>${userFriends.join(",  ")}</p>
  `;
};

const displayUserGreeting = (user, date) => {
  const userGreeting = document.querySelector('.welcome-header');
  const dayjs = require('dayjs')
  const customParseFormat = require('dayjs/plugin/customParseFormat');
  dayjs.extend(customParseFormat);
  const dateString = date;
  const dateToday = dayjs(dateString, 'YYYY/MM/DD');

  const formattedDateString = dateToday.format('dddd D MMMM');
  userGreeting.innerHTML = `
  <p class="welcome welcome-date">${formattedDateString}</p>
  <h2 class="welcome">Hi, ${user.getFirstName()}</h2>
`;
};

// Hydration Function
const displayhydrationCard = (hydration, userID, date) => {
  hydrationCard.innerHTML = `
    <p class="bold-text water-text">Average Water Consumed</p> 
    <p class="water-text">${hydration.calculateAverageFluidPerUser(userID)} ounces </p>
    <p class="bold-text water-text">Water Drank Today</p> 
    <p class="water-text">${hydration.dailyOuncesConsumed(userID,date)} ounces </p>
  `;
  const waterButton = document.querySelector("#hydrationButton");
  waterButton.addEventListener("click", () => createHydrationChart(hydration, userID, date));
};

// Sleep Functions
const displaySleepCard = (sleep, userID, date) => {
  const latestSleepData = document.querySelector(".latest-sleep-data-js");
  latestSleepData.innerHTML = `
    <p class="bold-text sleep-text">Hours Slept</p>
    <p class="sleep-text">${sleep.findSleepHoursOnDate(userID, date)}</p>
    <p class="bold-text sleep-text">Sleep Quality</p>
    <p class="sleep-text">${sleep.findSleepQualityOnDate(userID, date)}</p>
  `;
  const allTimeSleepData = document.querySelector(".all-time-sleep-data-js");
  allTimeSleepData.innerHTML = `
    <p class="bold-text sleep-text">Average Hours Slept</p>
    <p class="sleep-text">${sleep.calculateAverageSleepHours(userID)}</p>
    <p class="bold-text sleep-text">Average Sleep Quality</p>
    <p class="sleep-text">${sleep.calculateAverageSleepQuality(userID)}</p>
  `;

  const hoursSleptButton = document.querySelector("#hoursSleptButton");
  hoursSleptButton.addEventListener("click", () =>
    createHoursSleptChart(sleep, userID, date)
  );
  const qualitySleptButton = document.querySelector(
    "#weeklySleepQualityButton"
  );
  qualitySleptButton.addEventListener("click", () =>
    createSleepQualityChart(sleep, userID, date)
  );
};

// Activity Function
const displayActivityCard = (activity, user, date) => {
  const activityCard = document.querySelector('.activity-card-js');
  activityCard.innerHTML = `
  <p class="bold-text activity-text">Miles Walked</p>
  <p class="activity-text"> ${activity.calculateMilesWalked(date, user)} miles</p>
  <p class="bold-text activity-text">Minutes Active</p>
  <p class="activity-text"> ${activity.dailyMinutesActive(user.id, date)} minutes</p>
  <p class="bold-text activity-text">Step Goal</p>
  <p class="activity-text">${activity.stepGoalMet(user, date)}</p>
  `;
  const activityButton = document.querySelector("#activityButton");
  activityButton.addEventListener("click", () => createActivityChart(activity, user.id, date));

  const mapButton = document.querySelector("#mapButton");
  mapButton.addEventListener("click", () => createMap(user));
};

// Chart Functions
const clearChartArea = () => {
  const chartArea = document.querySelector(".infographic");
  chartArea.classList.remove("map-error");
  chartArea.classList.remove("chart-placeholder");
  chartArea.innerHTML = `
  <div id="map"></div>
  <canvas id='chart'></canvas>`;
};

const createHydrationChart = (hydration, userID, date) => {
  const weeklyOunces = hydration.weeklyOuncesConsumed(userID, date);
  const labels = weeklyOunces.map(days => days.date);
  const data = weeklyOunces.map(days => days.numOunces);
  clearChartArea();
  new Chart("chart", {
    type: 'bar',
    data: {
      datasets: [{
        label: "ounces",
        backgroundColor: "#F57630",
        borderColor: "#3C4252",
        borderWidth: 2,
        hoverBackgroundColor: "#F68C52",
        hoverBorderColor: "#3C4252",
        data: data,
      }],
      labels: labels,
    }
  });
};

const createHoursSleptChart = (sleep, userID, date) => {
  const weeklyHours = sleep.calculateWeeklyHoursSlept(userID, date);
  const labels = weeklyHours.map(days => days.date);
  const data = weeklyHours.map(days => days.hoursSlept);
  clearChartArea();
  new Chart("chart", {
    type: "line",
    data: {
      datasets: [{
        label: "Hours Slept",
        backgroundColor: "#F16433",
        borderColor: "a25e9b",
        borderWidth: 2,
        hoverBackgroundColor: "#5A73C0",
        hoverBorderColor: "#5A73C0",
        data: data,
      }, ],
      labels: labels,
    },
  });
};

const createSleepQualityChart = (sleep, userID, date) => {
  const weeklyHours = sleep.calculateWeeklySleepQuality(userID, date);
  const labels = weeklyHours.map((days) => days.date);
  const data = weeklyHours.map((days) => days.sleepQuality);
  clearChartArea();
  new Chart("chart", {
    type: "bar",
    data: {
      datasets: [{
        label: "Sleep Quality",
        backgroundColor: "#F57630",
        borderColor: "#3C4252",
        borderWidth: 2,
        hoverBackgroundColor: "#F68C52",
        hoverBorderColor: "#3C4252",
        data: data,
      }, ],
      labels: labels,
    },
  });
};

const createActivityChart = (activity, userID, date) => {
  const weeklyMinutes = activity.weeklyMinutes(userID, date);
  const labels = weeklyMinutes.map(days => days.date);
  const data = weeklyMinutes.map(days => days.minutesActive);
  clearChartArea();
  new Chart("chart", {
    type: 'bar',
    data: {
      datasets: [{
        label: "minutes",
        backgroundColor: "#F57630",
        borderColor: "#3C4252",
        borderWidth: 2,
        hoverBackgroundColor: "#F68C52",
        hoverBorderColor: "#3C4252",
        data: data,
      }],
      labels: labels,
    }
  });
};

const createMap = (user) => {
  clearChartArea();
  const chartArea = document.querySelector(".infographic");
  chartArea.classList.remove("chart-placeholder");

  fetchMap(user)
    .then((mapXML) => {
      const mapData = mapXML.getElementsByTagName('rtept');
      if (mapData.length === 0) {
        throw new Error('No map data found for the given user');
      }
      buildMap(mapData);
    })
    .catch((error) => {
      console.error('Error:', error);
      chartArea.innerHTML = `
      <div class="map-error-container">
        <h2 class="map-error-title">You don't have any runs to show!</h2>
        <p class="map-error-message">Come back when you've run somewhere.</p>
      </div>
      `;
      chartArea.classList.add("map-error");
    });
};

const buildMap = (mapData) => {
  const coordinates = [...mapData].map(coord => {
    const lat = coord.getAttribute("lat");
    const lon = coord.getAttribute("lon");
    return [lat, lon];
  });
  const map = L.map('map', {
    center: coordinates[0],
    zoom: 13
  });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const path = L.polyline(coordinates, {
    color: 'rgba(56, 44, 94)',
    opacity: .75,
    weight: 5
  }).addTo(map);
  map.fitBounds(path.getBounds());
};

// Modal Functions
function displayModal() {
  MicroModal.show("hydrationModal");
};

form.addEventListener('submit', function (event) {
  event.preventDefault()
  let ouncesInput = document.getElementById("hydrationInput")
  let ouncesData = ouncesInput.value
  let dateInput = document.getElementById("start")
  let dateData = dayjs(dateInput.value).format("YYYY/MM/DD")
  fetch("http://localhost:3001/api/v1/hydration", {
      method: 'POST',
      body: JSON.stringify({
          userID: user.id,
          date: dateData,
          numOunces: Number(ouncesData)
        } //Input innnerText values?
      ),
      headers: {
        'content-Type': 'application/json'
      }
    })
    .then(response => {
      response.json()
      fetchHydration()
        .then((hydration) => {
          hydration = new Hydration(hydration.hydrationData);
          displayhydrationCard(hydration, user.id, date);
          displayModalSuccess();
          setTimeout(function () {
            let modalSuccess = document.querySelector(".modal-success-messages");
            modalSuccess.classList.add("hidden");
            MicroModal.close("hydrationModal");
          }, 3000);
        })
    })
    .catch(error => console.log("error", error));
});

const displayModalSuccess = () => {
  let modalSuccess = document.querySelector(".modal-success-messages");
  modalSuccess.classList.remove("hidden");
};

// Export Statements

export {
  displayUserCard,
  displayStepUserVsAllUsers,
  displayUserGreeting,
  displayhydrationCard,
  displaySleepCard,
  displayActivityCard,
  displayFriendsList,
  displayUserCardInitial,
};