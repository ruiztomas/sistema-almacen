const API='http://IP-SERVIDOR:3000/api';

document.getElementById('login').onclick=()=>{
    fetch(`${API}/auth/login`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            username:document.getElementById('username').value,
            password:document.getElementById('password').value,
        })
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.token){
            localStorage.setItem('token',data.token);
            localStorage.setItem('role',data.role);
            window.location.href='index.html';
        }else{
            document.getElementById('error').textContent=data.error;
        }
    });
};
