import React from "react";
import { motion } from "framer-motion";
import food1 from "../../public/img/food-1.png";
import food2 from "../../public/img/food-2.png";
import food3 from "../../public/img/food-3.png";
import food4 from "../../public/img/food-4.png";
import food5 from "../../public/img/food-5.png";
import food6 from "../../public/img/food-6.png";

const foods = [food1, food2, food3, food4, food5, food6];

export default function RotatingFoodCircle() {
  return (
    <div className="circle-container">
      {/* Kesik çizgili çember */}
      <div className="dashed-circle"></div>
      <motion.div
        className="rotating-circle"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      >
        {foods.map((src, index) => {
          // Çember üzerindeki açı hesaplanıyor
          const angle = (index / foods.length) * 360;
          return (
            <motion.img
              key={index}
              src={src}
              alt={`Food ${index + 1}`}
              className="food-item"
              style={{
                transform: `rotate(${angle}deg) translate(180px) rotate(-${angle}deg)`, // Resimler arasını açtık
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}