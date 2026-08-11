"use client";

import { useState } from "react";
import { Sparkles, Shirt } from "lucide-react";
import { motion } from "framer-motion";

export default function SuitConfigurator() {
  const [style, setStyle] = useState("Business Suit");
  const [color, setColor] = useState("Black");
  const [fabric, setFabric] = useState("Wool");
  const [lapel, setLapel] = useState("Peak");
  const [fit, setFit] = useState("Slim Fit");

  return (
    <section className="py-24 bg-[#101010]">
      <div className="container">

        <div className="text-center mb-16">
          <p className="uppercase tracking-[5px] text-yellow-400">
            Custom Tailoring
          </p>

          <h2 className="text-5xl font-bold mt-3">
            Build Your
            <span className="gold-gradient"> Perfect Suit</span>
          </h2>

          <p className="text-gray-400 mt-5">
            Design your outfit exactly the way you want.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          <motion.div
            whileHover={{ y: -5 }}
            className="glass rounded-3xl p-8"
          >

            <div className="space-y-6">

              <div>
                <label>Suit Style</label>

                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  <option>Business Suit</option>
                  <option>Tuxedo</option>
                  <option>Senator Wear</option>
                  <option>Kaftan</option>
                  <option>Wedding Suit</option>
                </select>
              </div>

              <div>
                <label>Colour</label>

                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                >
                  <option>Black</option>
                  <option>Navy Blue</option>
                  <option>White</option>
                  <option>Brown</option>
                  <option>Emerald Green</option>
                  <option>Burgundy</option>
                </select>
              </div>

              <div>
                <label>Fabric</label>

                <select
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                >
                  <option>Wool</option>
                  <option>Velvet</option>
                  <option>Linen</option>
                  <option>Cotton</option>
                </select>
              </div>

              <div>
                <label>Lapel Style</label>

                <select
                  value={lapel}
                  onChange={(e) => setLapel(e.target.value)}
                >
                  <option>Peak</option>
                  <option>Shawl</option>
                  <option>Notch</option>
                </select>
              </div>

              <div>
                <label>Fit</label>

                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                >
                  <option>Slim Fit</option>
                  <option>Regular Fit</option>
                  <option>Classic Fit</option>
                </select>
              </div>

            </div>

          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass rounded-3xl p-10 flex flex-col justify-center items-center"
          >

            <Shirt
              size={120}
              className="text-yellow-400"
            />

            <h3 className="mt-8 text-3xl font-bold">
              Live Preview
            </h3>

            <div className="mt-8 space-y-3 text-center">

              <p><strong>Style:</strong> {style}</p>

              <p><strong>Colour:</strong> {color}</p>

              <p><strong>Fabric:</strong> {fabric}</p>

              <p><strong>Lapel:</strong> {lapel}</p>

              <p><strong>Fit:</strong> {fit}</p>

            </div>

            <button className="mt-10 bg-yellow-400 text-black rounded-full px-8 py-4 font-bold flex gap-2 items-center">

              <Sparkles size={18} />

              Save Design

            </button>

          </motion.div>

        </div>

      </div>
    </section>
  );
}