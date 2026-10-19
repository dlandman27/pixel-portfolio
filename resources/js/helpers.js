$(function () {
  $('#map').load('resources/components/map.html?v=park-8', function () {
    if (window.Park) Park.start();
  });

  $('#fishbook').load('resources/modals/fishbook.modal.html', function () {});

  $('#achievement').load('resources/modals/achievement.toast.html', function () {});

  $('#painting-lightbox').load('resources/modals/painting.lightbox.html', function () {});
  
  // Load project lightbox modal
  $('body').append('<div id="project-lightbox"></div>');
  $('#project-lightbox').load('resources/modals/portfolio-project.lightbox.html', function () {});
});
