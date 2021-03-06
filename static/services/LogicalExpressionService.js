angular.module('ServicesModule', ['ngFileSaver']).factory('LogicalExpressionService', function(){
    function LogicalExpressionInstance(obj){
        if(typeof obj == 'undefined')
        {
            this.operand1 = null
            this.operator = null
            this.operand2 = null
        }else{
            if(typeof obj.operand1 == 'object') {
                if(typeof obj.operand1.operand1 != 'undefined') {
                    this.operand1 = new LogicalExpressionInstance(obj.operand1);
                }
                else if(typeof obj.operand1.id != 'undefined') {
                    var attribute = obj.operand1;
                    attribute.logical_expression = new LogicalExpressionInstance(attribute.logical_expression);
                    this.operand1 = attribute;
                }else if (typeof obj.operand1.name != 'undefined') {
                    this.operand1 = obj.operand1;
                }
            }else {
                this.operand1 = {name:obj.operand1};
            }

            if(typeof obj.operator == 'object') {
                this.operator = obj.operator;
            } else {
                this.operator = {name:obj.operator}
            }

            if(typeof obj.operand2 == 'object') {
                if(typeof obj.operand2.operand2 != 'undefined') {
                    this.operand2 = new LogicalExpressionInstance(obj.operand2);
                }
                else if(typeof obj.operand2.id != 'undefined') {
                    var attribute = obj.operand2;
                    attribute.logical_expression = new LogicalExpressionInstance(attribute.logical_expression);
                    this.operand2 = attribute;
                }else if (typeof obj.operand2.name != 'undefined') {
                    this.operand2 = obj.operand2;
                }
            }else {
                this.operand2 = {name:obj.operand2};
            }
        }

        this.changeBasedOnHierarchy = changeBasedOnHierarchy;
    };

    var changeBasedOnHierarchy = function(dragObj, dragEvent, arrayToCheck) {

        if(!isValidDrop(dragObj, dragEvent, arrayToCheck)) {
            return;
        };

        var hierarchy = document.getElementsByClassName("drag-enter")[0].classList[0].split('_');
        var levelToChange = this;

        if(hierarchy.length > 0)
        {
           hierarchy.map(function(val, index){
                switch(val){
                    case 'op1':
                        if(index == (hierarchy.length - 1))
                        {
                            if(dragObj.name == 'Parentheses')
                            {
                                levelToChange['operand1'] = new LogicalExpressionInstance();
                            }else{
                                levelToChange['operand1'] = dragObj;
                            }
                        }else{
                            levelToChange = levelToChange['operand1'];
                        }
                        break;
                    case 'op':
                        if(index == (hierarchy.length - 1))
                        {
                            levelToChange['operator'] = dragObj;
                        }else{
                            levelToChange = levelToChange['operator'];
                        }
                        break;
                    case 'op2':
                        if(index == (hierarchy.length - 1))
                        {
                            if(dragObj.name == 'Parentheses')
                            {
                                levelToChange['operand2'] = new LogicalExpressionInstance();
                            }else{
                                levelToChange['operand2'] = dragObj;
                            }
                        }else{
                            levelToChange = levelToChange['operand2'];
                        }
                        break;
                }
           });
        }
    }

    var isValidDrop = function(dragObj, dragEvent, arrayToCheck) {
        var isValidDrop = false;
        var hierarchy = document.getElementsByClassName("drag-enter")[0].classList[0].split('_');
        var dropType = hierarchy[hierarchy.length - 1];

        switch(dropType) {
            case 'op':
                angular.forEach(arrayToCheck, function(operator){
                    if((dragObj.name != 'Parentheses' && dragObj.name == operator.name) || dragObj.name == ''){
                        isValidDrop = true;
                    }
                });
                break;
            case 'op1':
            case 'op2':
                isValidDrop = true;
                angular.forEach(arrayToCheck, function(operator){
                    var test = 'help';
                    if(dragObj.name != 'Parentheses' && dragObj.name == operator.name){
                        isValidDrop = false;
                    }
                });
                break;
        }

        return isValidDrop;
    };

    var isExpressionNotEmpty = function(logical_expression) {
        if(logical_expression.operand1 != null && typeof logical_expression.operand1 == 'object') {
            if(typeof logical_expression.operand1.operand1 != 'undefined') {
                return isExpressionNotEmpty(logical_expression.operand1);
            }else if (typeof logical_expression.operand1.name == 'undefined') {
                return false;
            }
        }else {
            if(logical_expression.operand1 == null || logical_expression.operand1 == ''){
               return false;
            }
        }

        if(logical_expression.operator != null && typeof logical_expression.operator == 'object') {
            if (typeof logical_expression.operator.name == 'undefined' || logical_expression.operator.name == '') {
                return false;
            }
        } else {
            if(logical_expression.operator == '' || logical_expression.operator == null){
               return false;
            }
        }

        if(logical_expression.operand2 != null && typeof logical_expression.operand2 == 'object') {
            if(typeof logical_expression.operand2.operand1 != 'undefined') {
                return isExpressionNotEmpty(logical_expression.operand2);
            }else if (typeof logical_expression.operand2.name == 'undefined') {
                return false;
            }
        }else {
            if(logical_expression.operand2 == null || logical_expression.operand2 == ''){
               return false;
            }
        }

        return true;
    };

    var getFirstEmptyDrop = function(type) {
        var emptyDrops = document.getElementsByClassName("empty_"+type);
        var firstEmpty = null;

        angular.forEach(emptyDrops, function(emptyDrop){
            var classList = emptyDrop.classList;

            angular.forEach(classList, function(classString){
                if(type == 'operand')
                {
                    if(firstEmpty == null && (classString.indexOf('op1') != -1 || classString.indexOf('op2') != -1)){
                        firstEmpty = emptyDrop;
                    }
                }

                if(type == 'operator')
                {
                    if(firstEmpty == null && (classString.indexOf('op') != -1)){
                        firstEmpty = emptyDrop;
                    }
                }
            });
        });

        if(firstEmpty == null) {
            return getLastDrop(type);
        }

        return firstEmpty;
    };

    var getLastDrop = function(type) {
        if(type == 'operand')
        {
            var drops = document.getElementsByClassName("operandDrop");
        }

        if(type == 'operator')
        {
            var drops = document.getElementsByClassName("operatorDrop");
        }

        if(type == 'all')
        {
            var drops = document.getElementsByClassName("fullDrop");
        }

        return drops[drops.length - 1];
    };

    var convertToString = function(expression) {
        var expressionString = '(';

        if(expression.operand1 != null && typeof expression.operand1 == 'object') {
            if(typeof expression.operand1.operand1 != 'undefined') {
                expressionString += convertToString(expression.operand1);
            }
            else if(typeof expression.operand1.name != 'undefined') {
                expressionString += expression.operand1.name + ' '
            }
        }

        if(expression.operator != null && typeof expression.operator == 'object') {
            expressionString += ' ' +  expression.operator.name + ' '
        }

        if(expression.operand2 != null && typeof expression.operand2 == 'object') {
            if(typeof expression.operand2.operand1 != 'undefined') {
                expressionString += convertToString(expression.operand2);
            }
            else if(typeof expression.operand2.name != 'undefined') {
                expressionString += expression.operand2.name + ' '
            }
        }

        return expressionString + ')';
    }

    return {
        createNew: function(obj) {
            return new LogicalExpressionInstance(obj);
        },
        isValidDrop: isValidDrop,
        isExpressionNotEmpty: isExpressionNotEmpty,
        getFirstEmptyDrop: getFirstEmptyDrop,
        getLastDrop: getLastDrop,
        convertToString: convertToString
    };
});