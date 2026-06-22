import heroImg from "./assets/docker.png";
import "./App.css";

function App() {
  return (
    <>
      <section id="">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
        </div>
        <div>
          <h1>
            Learning Docker
            <span className="subtitle">with Prakash TM</span>
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ul style={{ textAlign: "left", listStylePosition: "outside" }}>
              <li>Docker and Docker hub setup in local machine.</li>
              <li>Docker image generation and containerization.</li>
              <li>Push and pull from docker hub.</li>
              <li>
                Create container, run the image, stop and remove the image in
                local.
              </li>
              <li>
                Implemented an automated CI/CD pipeline that triggers the Docker
                Image Build and Push the Image to Docker Hub whenever code
                changes are pushed to the main/source branch.
              </li>
              <li>
                Implemented an automated CI/CD pipeline that triggers builds and
                deploy to Github pages whenever code changes are pushed to the
                main/source branch.
              </li>
              <li>Azure account and CLI setup</li>
              <li>
                Implemented an automated CI/CD pipeline that triggers builds and
                deploy to Azure Container Instances (ACI) service whenever code
                changes are pushed to the main/source branch.
              </li>
              <li>
                Implemented an automated CI/CD pipeline that triggers builds and
                deploy to Azure Container Registry (ACR) service and App service
                whenever code changes are pushed to the main/source branch.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
