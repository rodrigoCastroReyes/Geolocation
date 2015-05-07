(function(){
	//python -m SimpleHTTPServer 9000
	var API_WEATHER_KEY="";
	var API_WORLDTIME_KEY="5da67daffb72c14902f360e3ad781";
	var API_WORLDTIME="http://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key="+API_WORLDTIME_KEY+"&q=";

	var API_WEATHER_URL="http://api.openweathermap.org/data/2.5/weather?APPID="+API_WEATHER_KEY + "&";
	var IMG_WEATHER= "http://openweathermap.org/img/w/";
	
	var cities=[];

	var today= new Date();
	var timeNow=today.toLocaleTimeString();

	var body=$("body");

	var nombreNuevaCiudad=$("[data-input='cityAdd']");
	var buttonAdd=$("[data-button='add']");
	var buttonCities=$("[data-saved-cities]");

	var cityWeather={};
	var KEY_ENTER=13;
	cityWeather.zone;
	cityWeather.icon;
	cityWeather.temp;
	cityWeather.temp_max;
	cityWeather.temp_min;
	cityWeather.main;

	$(buttonAdd).on("click",addNewCity);//on(); funcion de jquery
	$(buttonCities).on("click",loadCities);

	$(nombreNuevaCiudad).on("keypress",function(event){
		if(event.which==KEY_ENTER){
			addNewCity(event);
		}
	});

	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(getCoords,errorFound);
	}else{
		alert("Actualiza tu guevada");
	}
	function errorFound(error){
		alert("Error has ocurred" + error.code);
		/*
		0: Error desconocido
		1: Permiso denegado
		2: Posicion no esta disponible
		3: Timeout
		*/
	}
	function getCoords(position){
		var lat=position.coords.latitude;
		var lon= position.coords.longitude;
		console.log("Your position is: "+ lat +";"+ lon);
		$.getJSON(API_WEATHER_URL+"lat="+ lat +"&lon="+lon,getCurrentWeather);
	};

	function getCurrentWeather(data){
		saveData(cityWeather,data);
		renderTemplate(cityWeather);
	};

	function saveData(cityWeather,data){
		cityWeather.zone = data.name;
		cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
		cityWeather.temp = data.main.temp-273.15;
		cityWeather.temp_max = data.main.temp_max-273.15;
		cityWeather.temp_min = data.main.temp_min-273.15;
		cityWeather.main = data.weather[0].main;
	}

	function activateTemplate(id){
		var template=document.querySelector(id);
		return document.importNode(template.content,true);
	}

	function renderTemplate(cityWeather,localtime){
		var clone = activateTemplate("#template--city");
		if(localtime!=null){
			clone.querySelector("[data-time]").innerHTML=localtime;
		}else{
			clone.querySelector("[data-time]").innerHTML=timeNow;	
		}
		clone.querySelector("[data-city]").innerHTML=cityWeather.zone;
		clone.querySelector("[data-icon]").src=cityWeather.icon;
		clone.querySelector("[data-temp='max']").innerHTML=cityWeather.temp_max.toFixed(1);
		clone.querySelector("[data-temp='min']").innerHTML=cityWeather.temp_min.toFixed(1);
		clone.querySelector("[data-temp='current']").innerHTML=cityWeather.temp.toFixed(1);
		$(".loader").hide();
		$(body).append(clone);
	}

	function addNewCity(event){
		event.preventDefault();//submit() en default
		$.getJSON(API_WEATHER_URL+"q="+ nombreNuevaCiudad.val(),getWeatherNewCity);//lamada a AJAX
	}

	function getWeatherNewCity(data){
		cityWeather={};
		var time;
		$.getJSON(API_WORLDTIME+nombreNuevaCiudad.val(),function(response){
			time=response.data.time_zone[0].localtime;
			saveData(cityWeather,data);
			renderTemplate(cityWeather,time);
			nombreNuevaCiudad.val("");

			cities.push(cityWeather);
			localStorage.setItem("cities",JSON.stringify(cities));
		});
	}

	function loadCities(event){
		console.log("en on click");
		event.preventDefault();
		function renderCities(cities){
			cities.forEach(function(city){
				renderTemplate(city);
			});
		}
		var cities=JSON.parse(localStorage.getItem("cities"));
		renderCities(cities);
	}
	
})();
//closures
