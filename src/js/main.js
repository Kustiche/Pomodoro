class Pomodoro {
  constructor(pomodoro, short, long) {
    this.pomodoro = JSON.parse(localStorage.getItem('pomodoroValue')) ?? pomodoro;
    this.short = JSON.parse(localStorage.getItem('shortValue')) ?? short;
    this.long = JSON.parse(localStorage.getItem('longValue')) ?? long;

    this.minutes = 0;
    this.seconds = 0;
    this.interval = null;
    this.typeTimer = 'pomodoro';
    this.numIterations = 0;

    this.timer = document.querySelector('.pomodoro__timer');
    this.btnStart = document.querySelector('.functional__start');
    this.btnReset = document.querySelector('.functional__reset');
    this.form = document.querySelector('.form');
    this.inputPomodoro = document.querySelector('.form__input-pomodoro');
    this.inputShort = document.querySelector('.form__input-short');
    this.inputLong = document.querySelector('.form__input-long');

    this.modalSettings = document.querySelector('#modalSettings');

    this.startListeners();
    this.updateMinutes();
  }

  startListeners() {
    this.btnStart.addEventListener('click', () => {
      const isClassActive = !this.btnStart.classList.contains('active');

      if (isClassActive) {
        this.btnStart.classList.add('active');

        this.start();
      } else {
        this.btnStart.classList.remove('active');

        this.stop();
      }
    });

    this.btnReset.addEventListener('click', () => {
      this.updateMinutes();
      this.stop();

      this.btnStart.classList.remove('active');
    });

    this.modalSettings.addEventListener('click', (e) => {
      if (e.target.closest('.settings__wrap') === null) {
        this.closeModal();
      }
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      this.saveValuesInputs();
      this.updateParameters();
      this.updateMinutes();
      this.stop();
      this.closeModal();

      this.btnStart.classList.remove('active');
    });
  }

  start() {
    this.interval = setInterval(() => {
      const minutes = this.minutes >= 10 ? this.minutes : `0${this.minutes}`;
      const seconds = this.seconds >= 10 ? this.seconds : `0${this.seconds}`;

      if (this.seconds === 0 && this.minutes !== 0) {
        this.minutes = --this.minutes;
        this.seconds = 10;
      } else if (this.seconds !== 0) {
        this.seconds = --this.seconds;
      } else if (this.minutes === 0 && this.seconds === 0) {
        this.timer.textContent = `${minutes}:${seconds}`;

        this.switchTimer(this.typeTimer);
      }

      this.timer.textContent = `${minutes}:${seconds}`;
    }, 100);
  }

  switchTimer(type) {
    if (type === 'pomodoro') {
      if (this.numIterations !== 3) {
        this.typeTimer = 'short';
        this.minutes = this.short;
      } else {
        this.typeTimer = 'long';
        this.minutes = this.long;
      }

      this.stop();
      this.start();
    } else if (type === 'short') {
      ++this.numIterations;
      this.typeTimer = 'pomodoro';
      this.minutes = this.pomodoro;

      this.stop();
      this.start();
    } else if (type === 'long') {
      this.typeTimer = 'pomodoro';
      this.minutes = this.pomodoro;
      this.numIterations = 0;

      this.stop();
      this.start();
    }
  }

  stop() {
    clearInterval(this.interval);
  }

  updateMinutes() {
    this.typeTimer = 'pomodoro';
    this.numIterations = 0;
    this.minutes = this.pomodoro;
    this.seconds = 0;

    const minutes = this.minutes >= 10 ? this.minutes : `0${this.minutes}`;

    this.timer.textContent = `${minutes}:00`;
  }

  updateParameters() {
    this.pomodoro = this.inputPomodoro.value;
    this.short = this.inputShort.value;
    this.long = this.inputLong.value;
  }

  saveValuesInputs() {
    localStorage.setItem('pomodoroValue', JSON.stringify(this.inputPomodoro.value));
    localStorage.setItem('shortValue', JSON.stringify(this.inputShort.value));
    localStorage.setItem('longValue', JSON.stringify(this.inputLong.value));
  }

  closeModal() {
    this.modalSettings.close();
  }
}

new Pomodoro(1, 2, 3);
