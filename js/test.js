function postData(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const statusMessage = document.createElement('img');
        statusMessage.src = message.loading;
        statusMessage.style.cssText = `
            display: block;
            margin: auto;
        `;
        form.insertAdjacentElement('afterend', statusMessage);

        const request = new XMLHttpRequest();
        request.open('POST', 'server.php');
        request.setRequestHeader('Content-type', 'application/json');

        const formData = new FormData(form);
        const obj = {};
        formData.forEach(function (value, key){
            obj[key] = value;
        })

        const json = JSON.stringify(obj);

        request.send(json);
        request.addEventListener('load', () => {
            if(request.status === 200){
                console.log(request.response);
                showThanksModal(message.success);
                form.reset();
                statusMessage.remove();
            } else {
                showThanksModal(message.failure);
            }
        })
    });
}

const arr = [4, 2, 1, 42, 11, 22, 98];
console.log(arr.reduce((s, c) => s + c));