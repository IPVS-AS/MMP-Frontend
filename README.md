# ![MMP](src/assets/img/brand/mmp_icon.svg) Industry 4.0 - Model Management Platform - Frontend
The frontend project of the Industry 4.0 - Model Management Platform.
The frontend ist based on [Angular](https://angular.io/guide/quickstart) and uses the [CoreUI admin template](https://github.com/coreui/coreui-free-angular-admin-template) that is based on [Bootstrap](https://getbootstrap.com/).

# Install


## Prerequisites
Update and upgrade the package manager
```bash
sudo apt update
sudo apt upgrade
```
Add repository for the latest nodejs version and install
```bash
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
```
Install nodejs
```bash
sudo apt install nodejs
```
## Clone the repository
Clone the repo but make sure a valid ssh key has been set in gitlab or use https
```bash
git clone git@gitlab-as.informatik.uni-stuttgart.de:schiercn/EnPro-Industrie_4.0_Model_Management-Frontend.git
```

## Install required packages 

go into app's directory
```bash
cd EnPro-Industrie_4.0_Model_Management-Frontend
```
Install defined packages in the package.json file via npm 
```bash
npm install
```

# Run
The frontend can be run in development mode or in production mode.
## Run in development mode
Run the web app locally so it is available on [http://localhost:4200](http://localhost:4200). It communicates with the local backend on [http://localhost:8080](http://localhost:8080) when running with ng serve.

```bash
$ ng serve --open --watch
```

or use the short version

```bash
$ ng s --o --watch
```

## Run in production mode
Run the web app in production mode so it uses the production backend [http://192.168.209.139:8080](http://192.168.209.139:8080/v1/docs/index.html)

```bash
npm run start:prod
```

