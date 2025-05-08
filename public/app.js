angular.module('osceApp', [])
.controller('SchedulerController', ['$scope', '$http', function($scope, $http) {
  $scope.schedule = {};
  $scope.uploadStatus = '';
  $scope.counts = { examinees: 0, examiners: 0, clients: 0 };

  $scope.handleFiles = function(files) {
    if (!files || files.length === 0) {
      $scope.uploadStatus = 'No files selected';
      return;
    }

    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file); // Using 'files' as field name
    });

    $scope.uploadStatus = 'Uploading...';
    $http.post('/upload', formData, {
      headers: { 'Content-Type': undefined },
      transformRequest: angular.identity
    }).then(response => {
      $scope.uploadStatus = 'Upload successful!';
      $scope.counts = response.data.counts;
      console.log('Upload response:', response.data);
    }).catch(error => {
      $scope.uploadStatus = 'Upload failed: ' + 
        (error.data?.error || error.statusText);
      console.error('Upload error:', error);
    });
  };

  $scope.generateSchedule = function() {
    $http.post('/generate-schedule')
      .then(response => {
        $scope.schedule = response.data;
        console.log('Schedule generated:', response.data);
      })
      .catch(error => {
        console.error('Schedule error:', error);
        alert('Error generating schedule: ' + 
          (error.data?.error || error.statusText));
      });
  };

  // Initial debug check
  $http.get('/debug-data')
    .then(response => {
      console.log('Initial data state:', response.data);
    })
    .catch(error => {
      console.error('Debug check failed:', error);
    });
}]);
