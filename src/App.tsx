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
          <h1>Learning Docker</h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ul style={{ textAlign: "left", listStylePosition: "outside" }}>
              <li>Docker and Docker hub setup in local machine</li>
              <li>Docker image generation and containerization</li>
              <li>Push and pull from docker hub</li>
              <li>
                Create container, run the image, stop and remove the image in
                local
              </li>
              <li>Build and Push Docker Images with GitHub Actions</li>
              <li>
                Implemented an automated CI/CD pipeline that triggers builds and
                deployments whenever code changes are pushed to the main/source
                branch.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
