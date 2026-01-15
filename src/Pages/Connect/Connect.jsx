// src/Pages/Connect/Connect.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Smartphone,
    Laptop,
    Bike,
    Gem,
    Car,
    Home,
    Star,
    Gift,
    Trophy,
} from 'lucide-react';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    QuadraticBezierCurve3,
    Vector3,
    TubeGeometry,
    ShaderMaterial,
    Mesh,
    AdditiveBlending,
    DoubleSide,
    Color,
    PlaneGeometry,
} from "three";

const customFontStyle = {
    fontFamily: "'Neue Montreal Regular', sans-serif",
    fontWeight: 600,
    fontStyle: "normal",
};

const Connect = () => {
    // Three.js Background Logic
    const mountRef = useRef(null);
    const sceneRef = useRef();
    const rendererRef = useRef();
    const animationIdRef = useRef();

    // Scroll Logic for Timeline
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 10%", "end 90%"],
    });

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, 1000]); // Height in pixels (approx) - will adjust dynamic styling
    // We will use % for height in the render to be responsive
    const heightPercent = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new Scene();
        sceneRef.current = scene;

        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        rendererRef.current = renderer;

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xf8fafc, 0); // Set alpha to 0 for transparency
        mountRef.current.appendChild(renderer.domElement);

        // Create multiple curved light geometries for a more pronounced effect
        const curves = [
            new QuadraticBezierCurve3(
                new Vector3(-15, -3, 0),
                new Vector3(0, 1, 0),
                new Vector3(12, -2, 0)
            ),
            new QuadraticBezierCurve3(
                new Vector3(-14, -2, 0),
                new Vector3(1, 2, 0),
                new Vector3(10, -1, 0)
            ),
            new QuadraticBezierCurve3(
                new Vector3(-16, -4, 0),
                new Vector3(-1, 0.5, 0),
                new Vector3(11, -3, 0)
            )
        ];

        const colors = [
            new Color(0x88C1FF),
            new Color(0xA0D2FF),
            new Color(0x78B6FF),
        ];

        curves.forEach((curve, index) => {
            const tubeGeometry = new TubeGeometry(curve, 200, index === 0 ? 0.8 : 0.6, 32, false);
            const vertexShader = `
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;
            const fragmentShader = `
          uniform float time;
          uniform vec3 color;
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            vec3 baseColor = color;
            float pulse = sin(time * 1.5) * 0.1 + 0.9;
            float gradient = smoothstep(0.0, 1.0, vUv.x);
            float glow = 1.0 - abs(vUv.y - 0.5) * 2.0;
            glow = pow(glow, 2.0);
            float fade = 1.0;
            if (vUv.x > 0.7) {
              fade = 1.0 - smoothstep(0.7, 1.0, vUv.x);
            } else if (vUv.x < 0.2) {
              fade = smoothstep(0.0, 0.2, vUv.x);
            }
            vec3 finalColor = baseColor * gradient * pulse * glow * fade * 0.8;
            gl_FragColor = vec4(finalColor, glow * fade * 0.6);
          }
        `;
            const material = new ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    time: { value: 0 },
                    color: { value: colors[index] }
                },
                transparent: true,
                blending: AdditiveBlending,
                side: DoubleSide,
            });
            const lightStreak = new Mesh(tubeGeometry, material);
            lightStreak.rotation.z = index * 0.15;
            scene.add(lightStreak);
        });

        const backgroundGeometry = new PlaneGeometry(80, 55);
        const backgroundMaterial = new ShaderMaterial({
            vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
            fragmentShader: `
          varying vec2 vUv;
          uniform float time;
          void main() {
            vec3 blue1 = vec3(0.7, 0.85, 1.0);
            vec3 blue2 = vec3(0.6, 0.8, 1.0);
            vec3 blue3 = vec3(0.5, 0.75, 0.95);
            float timeFactor = sin(time * 0.2) * 0.05;
            vec3 color = mix(blue1, blue2, vUv.x + timeFactor);
            color = mix(color, blue3, vUv.x * 0.3 + timeFactor);
            float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.05;
            float blur = smoothstep(0.0, 0.2, vUv.x) * (1.0 - smoothstep(0.8, 1.0, vUv.x));
            gl_FragColor = vec4(color + noise, 0.15 * blur);
          }
        `,
            uniforms: { time: { value: 0 } },
            transparent: true,
            side: DoubleSide,
        });

        const background = new Mesh(backgroundGeometry, backgroundMaterial);
        background.position.z = -5;
        background.position.x = -2;
        scene.add(background);

        camera.position.z = 7;
        camera.position.y = -0.8;
        camera.position.x = -1;

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            const time = Date.now() * 0.001;
            scene.traverse((object) => {
                if (object instanceof Mesh && object.material instanceof ShaderMaterial) {
                    if (object.material.uniforms.time) {
                        object.material.uniforms.time.value = time;
                    }
                }
            });
            scene.children.forEach((child, index) => {
                if (child instanceof Mesh && index < curves.length) {
                    child.rotation.z = Math.sin(time * 0.1 + index * 0.5) * 0.05;
                }
            });
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!camera || !renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
            if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    const rewards = [
        {
            level: 1,
            title: "Star Agent",
            target: "₹15,000",
            icon: <Smartphone className="w-8 h-8 text-blue-500" />,
            items: ["Brand New Mobile"],
            image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQr6FyuyTO5LOxB0jO7KLqVn25JuxUgTNqIbTnj0oR0oH_Pqy5xecY4mDMR4OqF7zK_gHiNK4bkfWh1oTfBCUWBKTtxlCT3TR0vWMWBmhAuGz8QHR-otlp_Fg",
            color: "blue"
        },
        {
            level: 2,
            title: "Elite Agent",
            target: "₹30,000",
            icon: <Laptop className="w-8 h-8 text-purple-500" />,
            items: ["Premium Laptop"],
            image: "https://image.made-in-china.com/2f0j00gOPiJtwsiAqy/2022-New-Hot-Sale-Notebook-Laptop-Computer-F123-Global-Version-Windows10-12-3-Inch-Processor-N4125-Laptop-Notebook.webp",
            color: "purple"
        },
        {
            level: 3,
            title: "Silver Partner",
            target: "₹75,000",
            icon: <Bike className="w-8 h-8 text-green-500" />,
            items: ["Sports Bike"],
            image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
            color: "green"
        },
        {
            level: 4,
            title: "Gold Partner",
            target: "₹2,50,000",
            icon: <Gem className="w-8 h-8 text-yellow-500" />,
            items: ["Gold Jewellery Set"],
            image: "https://bsmedia.business-standard.com/_media/bs/img/article/2024-06/14/full/20240614124558.jpg",
            color: "yellow"
        },
        {
            level: 5,
            title: "Diamond Director",
            target: "₹8,00,000",
            icon: <Car className="w-8 h-8 text-red-500" />,
            items: ["Alto Car"],
            image: "https://imgd.aeplcdn.com/1280x720/n/cw/ec/128506/maruti-suzuki-new-alto-k10-left-front-three-quarter0.jpeg?isig=0",
            color: "red"
        },
        {
            level: 6,
            title: "Crown Ambassador",
            target: "₹20,00,000",
            icon: <Home className="w-8 h-8 text-indigo-500" />,
            items: ["Luxury Villa / SUV"],
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
            color: "indigo"
        }
    ];

    return (
        <div style={customFontStyle} className="min-h-screen bg-transparent relative overflow-hidden">
            {/* Three.js Background Container */}
            <div ref={mountRef} className="fixed inset-0 w-full h-screen" style={{ zIndex: 0 }} />

            <div className="relative z-10 max-w-7xl mx-auto py-20 px-4 md:px-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-24 relative"
                >
                    {/* Glass Card for Header */}
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-full blur-3xl -z-10 transform scale-125 opacity-50"></div>

                    <span className="text-blue-600 font-bold tracking-wider uppercase bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm mb-4 inline-block shadow-sm">
                        Milestone To Success
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 drop-shadow-sm">
                        Your Journey of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Rewards</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                        Follow the path of success. Unlock each milestone to earn exclusive rewards and climb the ladder of achievement.
                    </p>
                </motion.div>

                {/* Milestone Timeline */}
                <div ref={containerRef} className="relative pb-20">

                    {/* Central Timeline Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 md:-ml-0.5 bg-gradient-to-b from-blue-100 via-slate-200 to-transparent rounded-full">
                        <motion.div
                            style={{ height: heightPercent, background: "linear-gradient(to bottom, #3b82f6, #8b5cf6)" }}
                            className="w-full rounded-full absolute top-0 left-0"
                        />
                    </div>

                    <div className="space-y-24">
                        {rewards.map((reward, index) => (
                            <div key={reward.level} className={`relative flex items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                                {/* Empty spacer for alternating layout */}
                                <div className="hidden md:block w-5/12"></div>

                                {/* Center Node */}
                                <div className="absolute left-0.5 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center z-20">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        className={`w-8 h-8 rounded-full border-4 border-white shadow-lg bg-${reward.color}-500 flex items-center justify-center`}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </motion.div>
                                </div>

                                {/* Content Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    className="ml-12 md:ml-0 md:w-5/12 bg-white/40 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl border border-white/50 group hover:bg-white/60 transition-all duration-300"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                                        <img
                                            src={reward.image}
                                            alt={reward.items[0]}
                                            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute bottom-4 left-4 z-20 text-white">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-${reward.color}-500`}>Level {reward.level}</span>
                                            </div>
                                            <h3 className="text-xl font-bold">{reward.title}</h3>
                                        </div>
                                        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                                            Target: {reward.target}
                                        </div>
                                    </div>

                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-${reward.color}-100/50 text-${reward.color}-600`}>
                                                {reward.icon}
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Reward</div>
                                                <div className="text-slate-800 font-bold">{reward.items[0]}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-32 text-center"
                >
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Ready to start your journey?</h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all shadow-blue-500/20"
                    >
                        Get Started Now
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default Connect;