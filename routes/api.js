var express = require("express");

var router = express.Router();
const Users = require('../model/users');
const Videos = require("../model/video");
const Upload = require("../config/upload");
const Movies = require("../model/movie");
const Showtimes=require("../model/showtime");
const Tickets=require("../model/ticket");
const Bills = require("../model/bill")

const JWT = require('jsonwebtoken');
const SECRETKEY = "FPT EDU";

// xử lý api bills

router.post('/add-bills', Upload.single('img'), async (req, res) => {
  try {
    const data = req.body; // lấy dữ liệu từ body
    const file = req.file; // lấy một file duy nhất

    const url = file ? `http://localhost:3000/uploads/${file.filename}` : null; // tạo đường dẫn URL

    const newBills = new Bills({
      payment_amount: data.payment_amount,
      Number_of_tickets: data.Number_of_tickets,
      Payment_methods: data.Payment_methods,
      date: data.date,
      time: data.time,
      id_uer: data.id_uer,
      status: data.status,
      img: url ? [url] : [] // lưu đường dẫn ảnh nếu có
    });

    const result = await newBills.save(); // thêm vào database
    if (result) {
      res.json({
        "status": 200,
        "messenger": "Thêm thành công",
        "data": result
      });
    } else {
      res.json({
        "status": 400,
        "messenger": "Lỗi, Thêm không thành công",
        "data": []
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});



// xử lý api làm việc về vé 

router.get("/get-tickets-by-user/:id_user", async (req, res) => {
  const { id_user } = req.params; // Lấy id_user từ params
  try {
    const tickets = await Tickets.find({ id_users: id_user }).populate("id_showtimes");
    if (tickets.length > 0) {
      res.json({
        status: 200,
        message: "Lấy thành công danh sách vé cho id_user đã cung cấp",
        data: tickets,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Không tìm thấy vé cho id_user đã cung cấp",
        data: [],
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vé theo id_user:', error);
    res.status(500).json({
      status: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách vé theo id_user",
      error: error.message,
    });
  }
});



router.get("/get-tickets-by-id_showtime/:id_showtimes", async (req, res) => {
  const { id_showtimes } = req.params; // Lấy id_user từ params
  try {
    const tickets = await Tickets.find({ id_showtimes: id_showtimes }).populate("id_showtimes");
    if (tickets.length > 0) {
      res.json({
        status: 200,
        message: "Lấy thành công danh sách vé cho id_user đã cung cấp",
        data: tickets,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Không tìm thấy vé cho id_user đã cung cấp",
        data: [],
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vé theo id_user:', error);
    res.status(500).json({
      status: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách vé theo id_user",
      error: error.message,
    });
  }
});



router.put('/update-tichket-by-id/:id',async(req,res)=>{
    try {
        const {id}=req.params;
        const data=req.body;
        const update=await Tickets.findById(id)
        let result=null;
        if(update){
            update.chair=data.chair?? update.chair;
            update.pay=data.pay?? update.pay,
            update.status=data.status?? update.status,
            update.id_showtimes=data.id_showtimes?? update.id_showtimes,
            update.id_users=data.id_users?? update.id_users,
            update.id_bills=data.id_bills?? update.id_bills,
            result=await update.save();
        }
        if(result){
            res.json({
                "status":200,
                    "messenger":"Cập nhật thành công",
                    "data":data
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/add-ticket', async (req, res) => {
  try {
      const data = req.body; // lấy dữ liệu từ body
      const newTicket = new Tickets({
        chair:data.chair,
        pay:data.pay,
        status:data.status,
        id_showtimes:data.id_showtimes,
        id_users:data.id_users,
        id_bills:data.id_bills,
      }); // tạo 1 đối tượng
      const result = await newTicket.save(); // thêm vào database
      if (result) {
          res.json({
              "status": 200,
              "messenger": "Thêm thành công",
              "data": result
          });
      } else {
          res.json({
              "status": 400,
              "messenger": "Lỗi, Thêm không thành công",
              "data": []
          });
      }
  } catch (error) {
      console.log(error);
  }
});

// xử lý đăng ký đăng nhập
router.post('/login-phone', async (req, res) => {
  try {
      const { phone, password } = req.body;
      const user = await Users.findOne({ phone, password});

      if (user) {
          const token = JWT.sign({ id: user.id }, SECRETKEY, { expiresIn: '1d' });
          const refreshToken = JWT.sign({ id: user.id }, SECRETKEY, { expiresIn: '7d' }); // Refresh token expires in 7 days

          res.json({
              status: 200,
              messenger: "Đăng nhập thành công",
              data: user,
              token: token,
              refreshToken: refreshToken
          });
      } else {
          res.status(401).json({
              status: 401,
              messenger: "Đăng nhập không thành công",
              data: []
          });
      }
  } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, messenger: "Lỗi server" });
  }
});

router.post('/login-email', async (req, res) => {
    try {
        const {email, password } = req.body;
        const user = await Users.findOne({ email, password });

        if (user) {
            const token = JWT.sign({ id: user.id }, SECRETKEY, { expiresIn: '1d' });
            const refreshToken = JWT.sign({ id: user.id }, SECRETKEY, { expiresIn: '7d' }); // Refresh token expires in 7 days

            res.json({
                status: 200,
                messenger: "Đăng nhập thành công",
                data: user,
                token: token,
                refreshToken: refreshToken // Fixed spelling mistake
            });
        } else {
            res.status(401).json({
                status: 401,
                messenger: "Đăng nhập không thành công",
                data: []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, messenger: "Lỗi server" });
    }
});

router.get("/check-email-exists/:email", async (req, res) => {
  const { email } = req.params; // Lấy số điện thoại từ params
  try {
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      res.json({
        status: 200,
        message: "Email đã tồn tại trong cơ sở dữ liệu.",
        data: existingUser
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Email chưa tồn tại trong cơ sở dữ liệu.",
        data: null,
      });
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra Email tồn tại:', error);
    res.status(500).json({
      status: 500,
      message: "Đã xảy ra lỗi khi kiểm tra Email tồn tại",
      error: error.message,
    });
  }
});

router.get("/check-phone-exists/:phone", async (req, res) => {
  const { phone } = req.params; // Lấy số điện thoại từ params
  try {
    const existingUser = await Users.findOne({ phone });
    if (existingUser) {
      res.json({
        status: 200,
        message: "Số điện thoại đã tồn tại trong cơ sở dữ liệu.",
        data: existingUser
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Số điện thoại chưa tồn tại trong cơ sở dữ liệu.",
        data: null,
      });
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra số điện thoại tồn tại:', error);
    res.status(500).json({
      status: 500,
      message: "Đã xảy ra lỗi khi kiểm tra số điện thoại tồn tại",
      error: error.message,
    });
  }
});

router.post('/sigin-account', async (req, res) => {
    try {
        const data = req.body; // lấy dữ liệu từ body
        const newProducts = new Users({
          name:data.name,
          email:data.email,
          phone:data.phone,
          password:data.password,
          date:data.date,
          sex:data.sex
        }); // tạo 1 đối tượng
        const result = await newProducts.save(); // thêm vào database
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            });
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, Thêm không thành công",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
    }
});

// Route để lấy danh sách showtime theo id_movie và date
router.get("/get-showtimes-by-movie-and-date/:id_movie/:date", async (req, res) => {
  const { id_movie, date } = req.params; // Lấy id_movie và date từ params
  const formattedDate = new Date(date).toISOString().split('T')[0];
  try {
    const showtimes = await Showtimes.find({ id_movie, date:formattedDate });
    if (showtimes.length > 0) {
      res.json({
        status: 200,
        message: "Lấy thành công showtime cho id_movie và date đã cung cấp",
        data:showtimes
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Không tìm thấy showtime cho id_movie và date đã cung cấp",
        data: [],
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách showtime theo id_movie và date:', error);
    res.status(500).json({
      status: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách showtime theo id_movie và date",
      error: error.message,
    });
  }
});

router.get("/get-list-showtimes", async (req, res) => {
  try {
    // Lấy danh sách showtimes từ cơ sở dữ liệu
    const showtimes = await Showtimes.find().sort({ date: 1 });

    // Tạo một đối tượng Map để lưu trữ các showtime theo ngày
    const showtimesByDate = new Map();

    // Duyệt qua từng showtime để lấy danh sách duy nhất theo ngày
    showtimes.forEach(showtime => {
      const date = showtime.date;

      // Nếu đã tồn tại một showtime cùng ngày trong Map, không thêm vào danh sách nữa
      if (!showtimesByDate.has(date)) {
        showtimesByDate.set(date, showtime);
      }
    });

    // Chuyển các giá trị từ Map sang mảng và sắp xếp theo ngày
    const uniqueShowtimes = [...showtimesByDate.values()];

    // Trả về danh sách showtimes đã lọc theo ngày
    res.json(uniqueShowtimes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách showtimes" });
  }
});
router.get("/get-videos-by-movie/:id_movie", async (req, res) => {
  const { id_movie } = req.params; // Lấy id_movie từ params
  try {
    const videos = await Videos.find({ id_movie });
    if (videos.length > 0) {
      res.json(videos);
    } else {
      res.status(404).json({
        status: 404,
        message: "Không tìm thấy video cho id_movie đã cung cấp",
        data: [],
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách video theo id_movie:', error);
    res.status(500).json({
      status: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách video theo id_movie",
      error: error.message,
    });
  }
});
router.get("/get-movie-by-id/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await Movies.findById(movieId);
    
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({
        status: 404,
        message: "Không tìm thấy movie",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Đã xảy ra lỗi khi lấy dữ liệu movie",
    });
  }
});

router.get("/get-list-videos", async (req, res) => {
  try {
    const data = await Videos.find().sort({ createdAt: -1 });
    if (data) {
      res.json(data);
    } else {
      res.json({
        status: 400,
        messenger: "lấy danh sách không thành công",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
  }
});
router.post("/add-videos", Upload.array("video", 5), async (req, res) => {
    try {
      const data = req.body;
      const { files } = req;
      const url = files.map(
        (file) => `${req.protocol}://localhost:3000/uploads/${file.filename}` // Sửa dấu gạch chéo kép thành một gạch chéo duy nhất
      );
  
      // url video sẽ được lưu dưới dạng: http://localhost:3000/uploads/filename
      const newVideo = new Videos({
        video: url,
        content:data.content,
        id_movie: data.id_movie,
      });
      const result = await newVideo.save();
      if (result) {
        res.json({
          status: 200,
          message: "Thêm thành công",
          data: result,
        });
      } else {
        res.json({
          status: 400,
          message: "Thêm không thành công",
          data: [],
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "Lỗi server" });
    }
  });
  

// router.get('/searchProduc',async (req,res)=>{
//     try {
//           const key=req.query.key;
//           const data=await Products.find({name:{"$regex":key,"$options":"i"}})
//                                         .sort({createdAt:-1});
//         if(data){
//             res.json({
//                     "status":200,
//                     "messenger":" thành công",
//                     "data":data
//             })
//         }else{
//             res.json({
//                 "status": 400,
//                 "messenger": "Lỗi,Không thành công",
//                 "data": []
//             })
//         }
//     } catch (error) {
//          console.log(error)
//     }
// })
// router.post('/add-Acount', async (req, res) => {
//     try {
//         const data = req.body; // lấy dữ liệu từ body
//         const newBill = new Users({
//             username: data.username,
//             password:data.password,
//             email: data.email,
//         }); // tạo 1 đối tượng
//         const result = await newBill.save(); // thêm vào database
//         if (result) {
//             res.json({
//                 "status": 200,
//                 "messenger": "Thêm thành công",
//                 "data": result
//             });
//         } else {
//             res.json({
//                 "status": 400,
//                 "messenger": "Lỗi, Thêm không thành công",
//                 "data": []
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });
// const JWT = require('jsonwebtoken');
// const SECRETKEY = "FPT EDU";

// router.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const user = await Users.findOne({ username, password });

//         if (user) {
//             const token = JWT.sign({ id: user.id }, SECRETKEY, { expiresIn: '1d' });
//             const refreshToken = JWT.sign({ id: user.id }, SECRETKEY, { expiresIn: '7d' }); // Refresh token expires in 7 days

//             res.json({
//                 status: 200,
//                 messenger: "Đăng nhập thành công",
//                 data: user,
//                 token: token,
//                 refreshToken: refreshToken // Fixed spelling mistake
//             });
//         } else {
//             res.status(401).json({
//                 status: 401,
//                 messenger: "Đăng nhập không thành công",
//                 data: []
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ status: 500, messenger: "Lỗi server" });
//     }
// });

// router.get('/get-bills',async(req,res)=>{
//     try {
//         const data =await Bills.find().sort({createdAt: -1});
//         if(data){
//             res.json(data)
//         }else{
//             res.json({
//                 "status":400,
//                     "messenger":"lấy danh sách không thành công",
//                     "data":[]
//             })
//         }

//     } catch (error) {
//         console.log(error)
//     }
// })
// router.post('/add-Bills', async (req, res) => {
//     try {
//         const data = req.body; // lấy dữ liệu từ body
//         const newBill = new Bills({
//             name: data.name,
//             price: data.price,
//             quantity: data.quantity,
//             username: data.username,
//             sl: data.sl,
//             img: data.img,
//             mota: data.mota,
//             date: data.date,
//         }); // tạo 1 đối tượng
//         const result = await newBill.save(); // thêm vào database
//         if (result) {
//             res.json({
//                 "status": 200,
//                 "messenger": "Thêm thành công",
//                 "data": result
//             });
//         } else {
//             res.json({
//                 "status": 400,
//                 "messenger": "Lỗi, Thêm không thành công",
//                 "data": []
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });
// // api cart

// router.get('/get-carts',async(req,res)=>{
//     try {
//         const data =await Carts.find().sort({createdAt: -1});
//         if(data){
//             res.json(data)
//         }else{
//             res.json({
//                 "status":400,
//                     "messenger":"lấy danh sách không thành công",
//                     "data":[]
//             })
//         }

//     } catch (error) {
//         console.log(error)
//     }
// })

// router.post('/add-carts', async (req, res) => {
//     try {
//         const data = req.body; // lấy dữ liệu từ body
//         const newProducts = new Carts({
//             name: data.name,
//             price: data.price,
//             quantity: data.quantity,
//             sl: data.sl,
//             img: data.img,
//             mota: data.mota,
//             id_category: data.id_category
//         }); // tạo 1 đối tượng
//         const result = await newProducts.save(); // thêm vào database
//         if (result) {
//             res.json({
//                 "status": 200,
//                 "messenger": "Thêm thành công",
//                 "data": result
//             });
//         } else {
//             res.json({
//                 "status": 400,
//                 "messenger": "Lỗi, Thêm không thành công",
//                 "data": []
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });

// router.delete('/delete-cart-by-id/:id',async (req,res)=>{
//     try {
//         const {id}=req.params
//         const result=await Carts.findByIdAndDelete(id)
//         if(result){
//             res.json({
//                 "status": 200,
//                 "messenger": "Xóa thành công",
//                 "data": result
//             })
//         }else
//         {
//             res.json({
//                 "status": 400,
//                 "messenger": "Xóa Không thành công",
//                 "data": []
//             })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })

// // api product

// router.get('/get-products-byid/:id_category', async (req, res) => {
//     const categoryId = req.params.id_category; // Lấy id_category từ request params
//     try {
//         const products = await Products.find({ id_category: categoryId }); // Sử dụng Mongoose để tìm các sản phẩm có id_category tương ứng
//         if (products.length > 0) {
//             res.json(products); // Trả về dữ liệu sản phẩm nếu có
//         } else {
//             res.status(404).json({
//                 status: 404,
//                 messenger: "Không tìm thấy sản phẩm nào cho id_category này",
//                 data: []
//             }); // Trả về thông báo nếu không có sản phẩm nào được tìm thấy cho id_category này
//         }
//     } catch (error) {
//         console.error("Lỗi khi lấy danh sách sản phẩm theo id_category:", error);
//         res.status(500).json({
//             status: 500,
//             messenger: "Đã xảy ra lỗi khi lấy danh sách sản phẩm theo id_category",
//             error: error.message
//         }); // Trả về lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình xử lý
//     }
// });

// router.get('/get-products',async(req,res)=>{
//     try {
//         const data =await Products.find().sort({createdAt: -1});
//         if(data){
//             res.json(data)
//         }else{
//             res.json({
//                 "status":400,
//                     "messenger":"lấy danh sách không thành công",
//                     "data":[]
//             })
//         }

//     } catch (error) {
//         console.log(error)
//     }
// })

// router.post('/add-products', async (req, res) => {
//     try {
//         const data = req.body; // lấy dữ liệu từ body
//         const newProducts = new Products({
//             name: data.name,
//             price: data.price,
//             quantity: data.quantity,
//             img: data.img,
//             mota: data.mota,
//             id_category: data.id_category
//         }); // tạo 1 đối tượng
//         const result = await newProducts.save(); // thêm vào database
//         if (result) {
//             res.json({
//                 "status": 200,
//                 "messenger": "Thêm thành công",
//                 "data": result
//             });
//         } else {
//             res.json({
//                 "status": 400,
//                 "messenger": "Lỗi, Thêm không thành công",
//                 "data": []
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });

// router.delete('/delete-products-by-id/:id',async (req,res)=>{
//     try {
//         const {id}=req.params
//         const result=await Products.findByIdAndDelete(id)
//         if(result){
//             res.json({
//                 "status": 200,
//                 "messenger": "Xóa thành công",
//                 "data": result
//             })
//         }else
//         {
//             res.json({
//                 "status": 400,
//                 "messenger": "Xóa Không thành công",
//                 "data": []
//             })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })

// router.put('/update-products-by-id/:id',async(req,res)=>{
//     try {
//         const {id}=req.params;
//         const data=req.body;
//         const update=await Products.findById(id)
//         let result=null;
//         if(update){
//             update.name=data.name?? update.name;
//             update.price=data.price?? update.price;
//             update.quantity=data.quantity?? update.quantity;
//             update.img=data.image?? update.img;
//             update.mota=data.mota?? update.mota;
//             update.id_category=data.id_category;
//             update.like=data.like?? update.like;
//             result=await update.save();

//         }
//         if(result){
//             res.json({
//                 "status":200,
//                     "messenger":"Cập nhật thành công",
//                     "data":data
//             })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })

// // api thể loại

// router.post('/add-categorys', async (req, res) => {
//     try {
//         const data = req.body; // lấy dữ liệu từ body
//         const newCategorys = new Categorys({
//             name: data.name
//         }); // tạo 1 đối tượng
//         const result = await newCategorys.save(); // thêm vào database
//         if (result) {
//             res.json({
//                 "status": 200,
//                 "messenger": "Thêm thành công",
//                 "data": result
//             });
//         } else {
//             res.json({
//                 "status": 400,
//                 "messenger": "Lỗi, Thêm không thành công",
//                 "data": []
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });
// router.get('/get-categorys',async(req,res)=>{
//     try {
//         const data =await Categorys.find().sort({createdAt: -1});
//         if(data){
//             res.json({
//                 "status":200,
//                 "messenger":"lấy danh sách thành công",
//                 "data":data}
//             )
//         }else{
//             res.json({
//                 "status":400,
//                     "messenger":"lấy danh sách không thành công",
//                     "data":[]
//             })
//         }

//     } catch (error) {
//         console.log(error)
//     }
// })

// router.delete('/delete-categorys-by-id/:id',async (req,res)=>{
//     try {
//         const {id}=req.params
//         const result=await Categorys.findByIdAndDelete(id)
//         if(result){
//             res.json({
//                 "status": 200,
//                 "messenger": "Xóa thành công",
//                 "data": result
//             })
//         }else
//         {
//             res.json({
//                 "status": 400,
//                 "messenger": "Xóa Không thành công",
//                 "data": []
//             })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })

// router.put('/update-categorys-by-id/:id',async(req,res)=>{
//     try {
//         const {id}=req.params;
//         const data=req.body;
//         const update=await Categorys.findById(id)
//         let result=null;
//         if(update){
//             update.name=data.name?? update.name;
//             result=await update.save();

//         }
//         if(result){
//             res.json({
//                 "status":200,
//                     "messenger":"Cập nhật thành công",
//                     "data":data
//             })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })

// router.put('/update-student-by-id/:id',async(req,res)=>{
//     try {
//         const {id}=req.params;
//         const data=req.body;
//         const update=await Sv.findById(id)
//         let result=null;
//         if(update){
//             update.hoten_ph32302=data.hoten_ph32302?? update.hoten_ph32302;
//             update.diem_ph32302=data.diem_ph32302?? update.diem_ph,
//             update.hinh_anh_ph32302=data.hinh_anh_ph32302?? update.hinh_anh_ph32302,
//             update.quequan_ph32302=data.quequan_ph32302?? update.quequan_ph32302,
//             result=await update.save();

//         }
//         if(result){
//             res.json({
//                 "status":200,
//                     "messenger":"Cập nhật thành công",
//                     "data":data
//             })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })

// router.post('/add-student', async (req, res) => {
//     try {
//         const data = req.body; // lấy dữ liệu từ body
//         const newProducts = new Sv({
//      hoten_ph32302: data.hoten_ph32302,
//      diem_ph32302:data.diem_ph32302,
//      hinh_anh_ph32302:data.hinh_anh_ph32302,
//      quequan_ph32302:data.quequan_ph32302,

//         }); // tạo 1 đối tượng
//         const result = await newProducts.save(); // thêm vào database
//         if (result) {
//             res.json({
//                 "status": 200,
//                 "messenger": "Thêm thành công",
//                 "data": result
//             });
//         } else {
//             res.json({
//                 "status": 400,
//                 "messenger": "Lỗi, Thêm không thành công",
//                 "data": []
//             });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });

// router.delete('/delete-student-by-id/:id',async (req,res)=>{
//     try {
//         const {id}=req.params
//         const result=await Sv.findByIdAndDelete(id)
//         if(result){
//             res.json({
//                 "status": 200,
//                 "messenger": "Xóa thành công",
//                 "data": result
//             })
//         }else
//         {
//             res.json({
//                 "status": 400,
//                 "messenger": "Xóa Không thành công",
//                 "data": []
//             })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })
// router.get('/get-students',async(req,res)=>{
//     try {
//         const data =await Sv.find().sort({createdAt: -1});
//         if(data){
//             res.json(data)
//         }else{
//             res.json({
//                 "status":400,
//                     "messenger":"lấy danh sách không thành công",
//                     "data":[]
//             })
//         }

//     } catch (error) {
//         console.log(error)
//     }
// })

module.exports = router;
