import React from "react";
import "../App.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Mission = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br spyder-app text-white">
      <Navbar />
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg max-w-3xl w-full">
          <h1 className="text-4xl text-center font-bold mb-8">Our Mission</h1>
          <div className="text-lg mb-8">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tell us ex
              aenean ultrices libero blandit tincidunt. Dicitum aliquam commodo
              nibh donec tincidunt, malesuada magna purus. Praesent curabitur
              malesuada ornare consequat elementum odio nostra fames. Inceptos
              pharetra fauci elementum ornare nisl nisl justo. Neque
              natum neque massa congue inceptos tenus est lictor. Blandit
              tempor leo nisi aliquet. Consectetur pellentesque finibus
              eleifend tincidunt convalibus curabitur. Eleifend est odio magna
              eu dictum arcu ex.
            </p>
            <p className="mt-4">
              Condimentum lacus parturient phasellus imperdiet tempus
              tempor dignissim bibendum. Maximus turpis nostra
              curabitur maximus id. Consequat eget amet justo imperdiet
              quam inhaemeus sapien nascent neceam. Nascetur phasellus
              tincidunt adipiscing odio tortor. Magna senectus tempus
              elit, porttitor augue pretium fuscue eu. Quam ultricies
              dis, porttitor arcu risus. Velit tellus mattis arcu
              dolor facilis.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Mission;
