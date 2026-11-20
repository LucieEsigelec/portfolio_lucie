const API_BASE_URL = "http://127.0.0.1:8000/api";
// const API_BASE_URL = "http://localhost:8000/api";

async function loadContactProfile() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/personnes/clara-masse`
        );

        if (!response.ok) {
            throw new Error(`Erreur API : ${response.status}`);
        }

        const data = await response.json();
        console.log("Profil reçu :", data);

        const links = data.profil?.contacts;

        if (!links) {
            throw new Error("Aucune coordonnée trouvée");
        }

        // Email
        const email = document.getElementById("contactEmail");
        if (email) {
            if (links.email) {
                email.textContent = links.email;
                email.href = `mailto:${links.email}`;
            } else {
                email.textContent = "Non renseigné";
                email.removeAttribute("href");
            }
        }

        // Téléphone
        const phone = document.getElementById("contactPhone");
        if (phone) {
            if (links.telephone) {
                phone.textContent = links.telephone;
                phone.href = `tel:${links.telephone.replace(/\s/g, "")}`;
            } else {
                phone.textContent = "Non renseigné";
                phone.removeAttribute("href");
            }
        }

        // LinkedIn
        const linkedin = document.getElementById("contactLinkedIn");
        if (linkedin) {
            if (links.linkedin) {
                linkedin.textContent = links.linkedin.replace(/^https?:\/\//, "");
                linkedin.href = links.linkedin;
            } else {
                linkedin.textContent = "Non renseigné";
                linkedin.removeAttribute("href");
            }
        }

        // GitHub
        const githubItem = document.getElementById("contactGitHubItem");
        const github = document.getElementById("contactGitHub");
        if (githubItem && github) {
            if (links.github) {
                github.textContent = links.github.replace(/^https?:\/\//, "");
                github.href = links.github;
                githubItem.hidden = false;
            } else {
                githubItem.hidden = true;
            }
        }

        console.log("Profil chargé !");

    } catch (error) {
        console.error("Erreur de chargement :", error);
    }
}

loadContactProfile();