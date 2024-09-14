document.addEventListener('alpine:init', () => {
  Alpine.data('products', () => ({
    items: [
      { id: 1, name: 'Coffee Beans', img: '1.jpg', price: 25000 },
      { id: 2, name: 'Coffee Expresso', img: '2.jpg', price: 35000 },
      { id: 3, name: 'Coffee Arab', img: '3.jpg', price: 55000 },
      { id: 4, name: 'Coffee Bean', img: '4.jpg', price: 25000 },
      { id: 5, name: 'Coffee Brand', img: '5.jpg', price: 35000 },
      { id: 6, name: 'Cappucino', img: '6.jpg', price: 15000 },
    ],
  }));

  Alpine.store('cart', {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // Cek apakah ada  barang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);
      // Jika belom ada/ cart kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        //jika barang yang sudah ada , cek apakah barang barang beda atau sama dengan barang  yang ada di cart
        this.item = this.items.map((item) => {
          //jika barang berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            //jika barang sudah ada, tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      //ambil item yang mau di remove berdasarkan id nya
      const cartItem = this.item.find((item) => item.id === id);

      //jika item lebih dari 1
      if (cartItem.quantity > 1) {
        //Telusuri
        this.items = this.items.map((item) => {
          //jika bukan barang yg dklik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        //jika barang sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

//form validation
const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;
const form = document.querySelector('#checkoutform');

form.addEventListener('keyup', function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove('disabled');
      checkoutButton.classList.add('disabled');
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove('disabled');
});

//Kirim data ketika tombol checkout diklick
checkoutButton.addEventListener('click', async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  // const message = formatMessage(objData);
  // window.open('https://wa.me/082272709524?text=' + encodeURIComponent(message));

  //minta transaction token menggunkan ajax/fecth
  try {
    const response = await fetch('php/placeOrder.php', {
      method: 'POST',
      body: data,
    });

    const token = await response.text();

    // console.log(token);
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

// Format pesan whatsapp
const formatMessage = (obj) => {
  return `Data Customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No.HP: ${obj.Phone}
    
Data Pesanan
    ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)})\n`)}
    TOTAL: ${rupiah(obj.total)}
    Terima kasih.`;
};

//Konfersi ke Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};