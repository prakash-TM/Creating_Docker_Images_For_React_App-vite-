# Azure Container Registry Deployment

yaml file - .github/workflows/deploy-app-to-azure-ACR.yaml

App url - http://react-app-docker-practice.azurewebsites.net/

az appservice plan create --name react-app-docker-preactice-plan --resource-group MyResourceGroup --sku B1 --is-linux

az webapp create --resource-group MyResourceGroup --plan react-app-docker-preactice-plan --name react-app-docker-practice --deployment-container-image-name reactappcontainerregistory.azurecr.io/react-app:latest

az webapp config container set --name react-app-docker-practice --resource-group MyResourceGroup --docker-custom-image-name reactappcontainerregistory.azurecr.io/react-app:latest --docker-registry-server-url https://reactappcontainerregistory.azurecr.io --docker-registry-server-user reactappcontainerregistory --docker-registry-server-password xxxxxxxxxxxxxxxxxxxxx

az webapp deployment container config --name react-app-docker-practice --resource-group MyResourceGroup --enable-cd true
