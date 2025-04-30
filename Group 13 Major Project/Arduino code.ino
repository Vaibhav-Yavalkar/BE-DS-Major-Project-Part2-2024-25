#include <Arduino.h>
#include "DHT.h"
#if defined(ESP32)
  #include <WiFi.h>
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>
#endif
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#define REPORTING_PERIOD_MS     3000

#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#define WIFI_SSID "Krishna"
#define WIFI_PASSWORD "10032003"
#define API_KEY "AIzaSyC8bDi78WzxIl2QXK_jbQiXaBAHfvIneMk"
#define DATABASE_URL "https://esp32-c093e-default-rtdb.firebaseio.com/" 
#define DHTPIN 4 
#define DHTTYPE DHT11

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;
float heart, SpO2, h, t;
PulseOximeter pox;
uint32_t tsLastReport = 0;
uint32_t x = 0;

TaskHandle_t Task1;
TaskHandle_t Task2;
DHT dht(DHTPIN, DHTTYPE);

void Tasksensor(void *pvParameters) {
  while(1){
    pox.update();
    if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
    
    Serial.print("bpm / SpO2:");
    SpO2 = pox.getSpO2();
    Serial.print(SpO2);
    
    Serial.print("Heart rate:");
    heart = pox.getHeartRate();
    Serial.print(heart);
    Serial.println("%");

    h = dht.readHumidity();
    t = dht.readTemperature();

    Serial.print("Humidity:");
    Serial.print(h);
    Serial.println("%");

    Serial.print("Temperature:");
    Serial.print(t);
    Serial.println(" C");

    tsLastReport = millis();
    }

}
}

void Taskfirebase(void *pvParameters) {
  while(1){
  if (Firebase.ready() && signupOK ) {
    if (Firebase.RTDB.setFloat(&fbdo, F("/test/Oximeter"), SpO2)){
       Serial.print("FirebaseOximeter: ");
       Serial.println(SpO2);    
       fbdo.clear();
    }
    
    if (Firebase.RTDB.setFloat(&fbdo, F("/test/HeartBit"), heart)){
       Serial.print("Firebase HeartBit: ");       
       Serial.println(heart);
       fbdo.clear();
    }

    if (Firebase.RTDB.setFloat(&fbdo, F("/test/Humidity"), h)){
       Serial.print("Firebase Humidity: ");       
       Serial.println(h);
       fbdo.clear();
    }

    if (Firebase.RTDB.setFloat(&fbdo, F("/test/Temperature"), t)){
       Serial.print("Firebase Temperature: ");       
       Serial.println(h);
       fbdo.clear();
    }

  }
  delay(5600);
}
}



void setup(){
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("ok");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.print("Initializing pulse oximeter..");
  if(!pox.begin()) {
    Serial.println("FAILED");
    for(;;);
  } 
  else 
  {
    Serial.println("SUCCESS");
  }

  
  Serial.println(F("DHT11 test!"));
  dht.begin();

  h = 200;
  t = 100;

  xTaskCreate(Tasksensor, "Tasksensor", 4096, NULL, 0, &Task1);
  xTaskCreate(Taskfirebase, "Taskfirebase", 8192, NULL, 1, &Task2);

}

void loop(){
  Serial.print("Free Heap: ");
  Serial.println(ESP.getFreeHeap());
  Serial.println("_");
  Serial.print("h="); Serial.println(h);
  Serial.print("t="); Serial.println(t);
  delay(5800);

}