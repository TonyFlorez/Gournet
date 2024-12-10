document.getElementById('proveedorForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;
    const direccion = document.getElementById('direccion').value;

    const response = await fetch('http://localhost:5000/api/proveedores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, telefono, correo, direccion })
    });

    if (response.ok) {
        alert("Proveedor agregado correctamente");
        cargarProveedores();
    } else {
        alert("Error al agregar proveedor");
    }

    this.reset();
});

async function cargarProveedores() {
    const response = await fetch('http://localhost:5000/api/proveedores');
    const proveedores = await response.json();

    const listaProveedores = document.getElementById('listaProveedores');
    listaProveedores.innerHTML = '';

    proveedores.forEach(proveedor => {
        const li = document.createElement('li');
        li.textContent = `${proveedor.nombre} - ${proveedor.telefono} - ${proveedor.correo} - ${proveedor.direccion}`;
        
        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.onclick = async () => {
            await fetch(`http://localhost:5000/api/proveedores/${proveedor.id}`, { method: 'DELETE' });
            alert("Proveedor eliminado correctamente");
            cargarProveedores();
        };

        li.appendChild(eliminarBtn);
        listaProveedores.appendChild(li);
    });
}

// Cargar proveedores al cargar la página
cargarProveedores();
