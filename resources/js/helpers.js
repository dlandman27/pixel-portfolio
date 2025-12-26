$(function () {
  $('#map').load('resources/components/map.html', function () {});

  $('#fishbook').load('resources/modals/fishbook.modal.html', function () {});

  $('#achievement').load('resources/modals/achievement.toast.html', function () {});

  $('#portfolio').load('resources/modals/portfolio.modal.html', function () {});

  $('#painting-lightbox').load('resources/modals/painting.lightbox.html', function () {});
  
  // Load project lightbox modal
  $('body').append('<div id="project-lightbox"></div>');
  $('#project-lightbox').load('resources/modals/portfolio-project.lightbox.html', function () {});
});