use std::fs::OpenOptions;
use std::io::Write;

pub fn log(msg: &str) {
    let mut f = OpenOptions::new()
        .create(true)
        .append(true)
        .open("D:\\ETS2 - ATS\\Euro Truck Simulator 2\\ets2_plugin.log")
        .unwrap();
    writeln!(f, "{}", msg).unwrap();
}
