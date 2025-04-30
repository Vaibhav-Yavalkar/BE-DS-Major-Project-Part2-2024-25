export default function handler(req, res) {
    if (req.method === "POST") {
      const { username, password } = req.body;
  
      // Replace with actual authentication logic
      if (username === "admin" && password === "password") {
        return res.status(200).json({ token: "fake-jwt-token" });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
    
    res.status(405).json({ error: "Method not allowed" });
}
  