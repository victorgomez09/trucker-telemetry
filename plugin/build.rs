// build.rs
use std::env;
use std::path::PathBuf;

fn main() {
    println!("cargo:rerun-if-changed=sdk_bridge.h");

    let bindings = bindgen::Builder::default()
        .header("sdk_bridge.h") // Usamos el bridge limpio
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .layout_tests(false)
        .generate()
        .expect("No se pudieron generar los bindings");

    let out_path = PathBuf::from(env::var("OUT_DIR").unwrap());
    bindings
        .write_to_file(out_path.join("bindings.rs"))
        .expect("No se pudo escribir bindings.rs");
}
