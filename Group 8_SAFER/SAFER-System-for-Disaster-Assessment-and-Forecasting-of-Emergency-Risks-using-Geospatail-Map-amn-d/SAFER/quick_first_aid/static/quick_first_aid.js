document.addEventListener("DOMContentLoaded", function () {
  var swiper = new Swiper(".swiper-container", {
    slidesPerView: "auto",
    spaceBetween: 20,
    centeredSlides: true,
    freeMode: false,

    on: {
      slideChange: function () {
        var slides = this.slides;
        for (var i = 0; i < slides.length; i++) {
          slides[i].style.opacity = 1;
          slides[i].style.filter = "none";
        }
        var activeIndex = this.activeIndex;
        slides.forEach(function (slide, index) {
          if (index !== activeIndex) {
            if (window.innerWidth <= 700) {
              slide.style.opacity = 0.5;
              slide.style.filter = "none";
            } else {
              slide.style.opacity = 0.5;
              slide.style.filter = "blur(99px)";
            }
          }
        });
      },
    },
  });
});

function openForm() {
  document.getElementById("symptomForm").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function closeForm() {
  document.getElementById("symptomForm").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

function openFormResult() {
  document.getElementById("symptomForm").style.display = "none";
  document.getElementById("symptomFormResult").style.display = "block";
}

function closeFormResult() {
  document.getElementById("symptomFormResult").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

