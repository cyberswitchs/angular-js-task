'use strict';
(function() {
	angular.module('shopApp', [])
	.service('GetDataService', ['$http', GetDataService])
	.service('GetTemplateService', ['$templateRequest', GetTemplateService])
	.filter('usdFilter', usdFilter)
	.controller('ShopController', ['GetDataService', shopController])
	.directive('customRepeat', ['$compile', 'GetDataService', 'GetTemplateService', customRepeat])
	.directive('fullInfo', ['$compile', 'GetTemplateService', fullInfo]);

	function GetDataService($http) {
		return $http.get('data/goods.json');
	}

	function GetTemplateService($templateRequest) {
		return {
			mainInfo: $templateRequest('templates/main-info.html'),
			mainInfoExpand: $templateRequest('templates/main-info-expand.html'),
			fullInfo: $templateRequest('templates/full-info.html')
		}
	}

	function usdFilter() {
		return function(price) {
			return price + " $";
		}
	}

	function shopController(GetDataService) {
		var vm = this;
		vm.currentItem = {};
		vm.hasCurrentItem = function() {
			return Object.keys(vm.currentItem).length && vm.currentItem.constructor === Object;
		}
	}

	function customRepeat($compile, GetDataService, GetTemplateService, ItemService) {
		return {
			restrict: 'A',
			controllerAs: 'listCtrl',
			controller: function($scope) {
				this.item = {};
				this.setItem = function(item) {
					if ($scope.shop.currentItem !== item) {
						$scope.shop.currentItem = {};
						this.item = item;
					};
				};
				this.hasItem = function(item) {
					return this.item === item;
				};
				this.openFullInfo = function(item) {
					$scope.shop.currentItem = this.item;
				};
			},
			link: function(scope, element, attributes, listCtrl) {
				GetDataService.then(function(response) {
					createListItems(response.data);
				}, function(response) {
					console.log(response);
				});
				function createListItems(data) {
					GetTemplateService.mainInfo.then(function(mainInfoHtml) {
						GetTemplateService.mainInfoExpand.then(function(mainInfoExpandHtml) {
							angular.forEach(data, function(item) {
								var newItemMainInfo = angular.element(mainInfoHtml).clone(),
									newItemMainInfoExpand = angular.element(mainInfoExpandHtml).clone(),
									childScope = scope.$new();
								childScope.item = item;
								newItemMainInfoExpand.attr('data-ng-show', 'listCtrl.hasItem(item)');
								newItemMainInfoExpand.find('button').attr('data-ng-click', 'listCtrl.openFullInfo(item)');
								newItemMainInfo.append(newItemMainInfoExpand);
								newItemMainInfo.attr('data-ng-click', 'listCtrl.setItem(item)');
								element.append(newItemMainInfo);
								$compile(newItemMainInfo)(childScope);
							});
						});
					});
				}
			}
		}
	}

	function fullInfo($compile, GetTemplateService, ItemService) {
		return {
			restrict: 'E',
			controller: function($scope) {
				$scope.item = {};
				$scope.$watch(function() {
					return $scope.shop.currentItem;
				}, function(newValue, oldValue) {
					if (newValue !== oldValue) {
						$scope.item = newValue;
					};
				});
			},
			link: function(scope, element, attributes) {
				GetTemplateService.fullInfo.then(function(html) {
					var template = angular.element(html);
					element.append(template);
					$compile(template)(scope);
				});
			}
		}
	}
	
	angular.bootstrap(document, ['shopApp']);
}());