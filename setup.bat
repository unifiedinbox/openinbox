@echo Installing Dependencies...
@call npm install
@call bower install
call grunt build
@echo Done
