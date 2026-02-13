// Här  hätmas knappar och rutor från HTML
const newGameBtn = document.getElementById("newGameBtn");
const newTilesBtn = document.getElementById("newTilesBtn");
const boardTiles = document.querySelectorAll("#board .tile");
const shelfTiles = document.querySelectorAll("#newTiles .tile");
const messageArea = document.getElementById("message");
const totPointsDisplay = document.getElementById("totPoints");
const countGamesDisplay = document.getElementById("countGames");

// här skpas variabel som har värde 0 & [] för att ha koll på poäng och nummer under spelet
let availableNumbers = []; // hur många siffror är kvar att använda (1-40)
let tilesPlacedThisRound = 0; //hur många av de 4 brickorna som placerats
let totalPoints = 0; // totalpoäng för alla spelomgångar
let gamesCount = 0; // antal spelade omgångar
let currentTile= null; //bricka som spelaren dra just nu

// Startinställningar- en lyssnare på window-objektet som väntar på att allt ska laddas klart (load) innan vi förbereder spelet.
window.addEventListener("load", function() {
    newTilesBtn.disabled = true; 
    newGameBtn.addEventListener("click", startNewGame);
    newTilesBtn.addEventListener("click", getFourNewTiles);
    
    setupDragAndDrop();// Förbered spelplanens rutor
    
});

// Funktioner 

// startar om spelet och nollställer planen
function startNewGame() {
    // Fyll listan med siffror 1 till 40 med en enkel loop
    availableNumbers = []; 
    for (let i = 1; i <= 40; i++) {
        availableNumbers.push(i);
    }

    tilesPlacedThisRound = 0;
    gamesCount = gamesCount + 1; // Öka antal spelade spel
    countGamesDisplay.textContent = gamesCount;

 // Rensa spelplanens rutor
    for (let i = 0; i < boardTiles.length; i++) {
        let ruta = boardTiles[i];
        ruta.textContent = ""; 
        ruta.classList.remove("hilightDropZone"); 
    }
// rensa bockar och kryss (resultatikoner)
    let allaResultat = document.querySelectorAll(".result");
    for (let i = 0; i < allaResultat.length; i++) {
        let ikon = allaResultat[i];
        ikon.classList.remove("check");
        ikon.classList.remove("cross");
    }

// uppdatera knappar och 
    newGameBtn.disabled = true;
    newTilesBtn.disabled = false;
 // uppdateras text (med hjälp av TextContent ändras text som spelaren se på sin skärm)
    messageArea.textContent = "Lycka till! Dra brickorna till planen.";
    getFourNewTiles();
}

// 2. Hämtar 4 slumpmässiga brickor
function getFourNewTiles() {
    newTilesBtn.disabled = true; 
    tilesPlacedThisRound = 0;
//används loop att gå igenom de 4 platserna på hyllan (shelfTiles)istället för att skriva samma kod 4 gånger
    for (let i = 0; i < shelfTiles.length; i++) {//loop
        let bricka = shelfTiles[i];

//skapar en if sats  för att kontrollera att det faktiskt finns nummer kvar i listan
        if (availableNumbers.length > 0) {
            // slumpa fram ett nummer från listan
            let slumpIndex = Math.floor(Math.random() * availableNumbers.length);
            let valtNummer = availableNumbers[slumpIndex];
            
            // ta bort det valda numret så det inte dras igen
            availableNumbers.splice(slumpIndex, 1);
            
            bricka.textContent = valtNummer;
            bricka.draggable = true; 
            
            // Spara vilket nummer vi drar i
            bricka.addEventListener("dragstart", function(handelse) {
                handelse.dataTransfer.setData("text", handelse.target.textContent);
                currentTile = handelse.target; //spara vilekn brickan som dras 
                // De är gammal verison som byt mot den upppe handelse.target.id = "dragging-now"; 
                
            });

            bricka.addEventListener("dragend", function () {
            currentTile = null;
});
        }
    }
}

// funktion som fixar drag-and-drop logiken med 
function setupDragAndDrop() {
//loopen för att gå genom varje ruta på spelplanet
    for (let i = 0; i < boardTiles.length; i++) {
        let ruta = boardTiles[i];
//föst händelse när spelaren håller en bricka över ruta
        ruta.addEventListener("dragover", function(handelse) {
            handelse.preventDefault(); // gör det möjligt att släppa
            if (ruta.textContent === "") {//if sats som möjligtgör att ha kontroll om rutan är tom för att förhindra att spelaren lägger flera brickor i samma rutan
                ruta.classList.add("hilightDropZone");
            }
        });
// den andra händelse om spelaren drar bort brickan från rutan utan att släppa
        ruta.addEventListener("dragleave", function() {
            ruta.classList.remove("hilightDropZone");//tar bort lyset (markeringen) eftersom brickan inte längre är ovanför
        });
// den tredje händelse när spelaren har faktiskt slept brickan i rutan
        ruta.addEventListener("drop", function(handelse) {
            handelse.preventDefault();
            ruta.classList.remove("hilightDropZone");// tar bort markering
//if sats för att kontrollera en sista gång att rutan är tom innan  skrivs siffran
     if (ruta.textContent === "") {
                let siffra = handelse.dataTransfer.getData("text");
                ruta.textContent = siffra;



// Töm rutan på hyllan efter att spelaren har släppt den på planen
 // BYTT-DEN ÄR GAMMALlet dragenBricka = document.getElementById("dragging-now");
    if (currentTile) {
        currentTile.textContent = "";
         currentTile.draggable = false;
         currentTile= null; 
 }

         tilesPlacedThisRound = tilesPlacedThisRound + 1;
        checkRoundProgress();
            }
        });
    }
}

// kollar om behövs fler brickor eller om spelet är slut
function checkRoundProgress() {
    if (tilesPlacedThisRound === 4) {
// räkna hur många rutor som totalt är fyllda på spelplanen
        let fylldaRutor = 0;
        for (let i = 0; i < boardTiles.length; i++) {
            if (boardTiles[i].textContent !== "") {
                fylldaRutor = fylldaRutor + 1;
            }
        }
        
        if (fylldaRutor === 16) {// kontorll att antalet rutor är exakt lika 
            endGame();
        } else {
            newTilesBtn.disabled = false;
            messageArea.textContent = "Hämta 4 nya brickor!";
        }
    }
}

//funktion för att räknar poäng och avsluta omgången
function endGame() {
let poängDennaRunda = 0;

// loopen hjälper att gå igenom alla 8 serier (4 rader + 4 kolumner)
    for (let i = 0; i <= 7; i++) {
        let serieRutor = document.querySelectorAll(".s" + i);

        //gör om texten till riktiga siffror med hjälp av textContent
        let v1 = parseInt(serieRutor[0].textContent);
        let v2 = parseInt(serieRutor[1].textContent);
        let v3 = parseInt(serieRutor[2].textContent);
        let v4 = parseInt(serieRutor[3].textContent);
        
        // med hjälp av if/elese satser kollar om de ligger i stigande ordning
        if (v1 < v2 && v2 < v3 && v3 < v4) {
            document.getElementById("result-s" + i).classList.add("check");
            poängDennaRunda = poängDennaRunda + 1;
        } else {
            document.getElementById("result-s" + i).classList.add("cross");
        }
    }

totalPoints = totalPoints + poängDennaRunda;
    totPointsDisplay.textContent = totalPoints;
    messageArea.textContent = "Klar! Du fick " + poängDennaRunda + " poäng.";// textContent för att ändra texten som syns på skärment till spelaren

    //bolean metod för att styra nappar 
    newGameBtn.disabled = false;//här ändras status på knappen att bli klickbar igen
    newTilesBtn.disabled = true;// här stopas knappen då är det slut av spelet
}