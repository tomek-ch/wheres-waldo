'use strict';

(function() {
const start = Date.now();
let score = 0;

async function showHighScores() {
    let message =
`High scores:
`;

    const highScores = (await firebase.firestore().collection('High Scores')
        .orderBy('time', 'asc')
        .limit(5)
        .get())
        .docs;

    for (let score of highScores) {
        // console.log(score.id, score.data().time);
        message +=
`${score.id}: ${score.data().time} s
`;
    };

    alert(message);
}

async function checkIfWon() {
    if (score === 5) {
        const time = Math.round((Date.now() - start) / 1000);
        const name = prompt(`You won! Your time was ${time} seconds!`, 'Your name');

        if (name) {
            const ref = firebase.firestore().collection('High Scores').doc(name);
            const data = (await ref.get()).data();
            const previousTime = data ? data.time : Infinity;
            // if (!data) {
            //     firebase.firestore().collection('High Scores').add({time: Infinity});
            // }
            
            if (time < previousTime) {
                firebase.firestore().collection('High Scores').doc(name).set({ time });
            }
        }

        showHighScores();
    }
}

async function getAnswer(character) {
    const query = firebase.firestore().collection('The Gobbling Gluttons').doc(character);
    return (await query.get()).data();
}

function markSpottedCharacter(answer) {
    const mark = document.createElement('div');
    mark.classList.toggle('mark');

    mark.style.top = `${answer.y - 3}%`;
    mark.style.left = `${answer.x - 1}%`;
    
    document.querySelector('.container').appendChild(mark);
}

async function setTarget(character, x, y) {
    document.querySelector('.box').remove();
    
    const answer = await getAnswer(character);
    const xDifferece = Math.abs(x - answer.x);
    const yDifference = Math.abs(y - answer.y);

    if (xDifferece < 3 && yDifference < 3) {
        markSpottedCharacter(answer);
        score++;
        checkIfWon();
    } 
}

function createCharacterDropdown(x, y) {
    const select = document.createElement('select');
    select.onclick = e => e.stopImmediatePropagation();
    select.onchange = e => setTarget(e.target.value, x, y);

    const placeholderOption = document.createElement('option');
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.hidden = true;
    select.appendChild(placeholderOption);

    for (let character of ['Waldo', 'Wizard', 'Wenda', 'Woof', 'Odlaw']) {
        const option = document.createElement('option');
        option.textContent = character;
        option.value = character;
        select.appendChild(option);
    }

    return select;
}

function pickTarget(e) {
    if (document.querySelector('.box')) {
        document.querySelector('.box').remove();
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; //x position within the element.
    const y = e.clientY - rect.top;  //y position within the element.
    const xPercent = Math.round(x / e.currentTarget.offsetWidth * 100);
    const yPercent = Math.round(y / e.currentTarget.offsetHeight * 100);

    const box = document.createElement('div');
    box.classList.toggle('box');
    box.style.top = `${yPercent - 5}%`;
    box.style.left = `${xPercent - 2.5}%`;

    box.appendChild(createCharacterDropdown(xPercent, yPercent));

    document.querySelector('.container').appendChild(box);
    // console.log(xPercent, yPercent)
}

document.querySelector('.container').addEventListener('click', pickTarget);
})();