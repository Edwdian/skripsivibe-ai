const API_URL = "http://localhost:5000/api/simulations";

export const saveSimulation = async (data) => {
  try {
    const response = await fetch(API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();

  } catch (error) {
    console.error("Gagal save simulasi:", error);
  }
};

export const getUserSimulations = async (uid) => {
  try {
    const response = await fetch(`${API_URL}/${uid}`);

    return await response.json();

  } catch (error) {
    console.error("Gagal get simulasi:", error);
    return [];
  }
};