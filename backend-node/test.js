

(async () => {
    try {
        const r = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'tourist@safarsathi.in', password: 'password123' })
        });
        const data = await r.json();
        console.log('Login status:', r.status);
        console.log('Token length:', data.token ? data.token.length : 0);

        const res = await fetch('http://localhost:8081/api/auth/profile/' + data.touristId, {
            headers: { 'Authorization': 'Bearer ' + data.token }
        });
        console.log('Profile status:', res.status);
        console.log('Profile body:', await res.text());
    } catch (err) {
        console.error(err);
    }
})();
