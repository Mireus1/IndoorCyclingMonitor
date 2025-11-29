import usb.core
import usb.util


def patch_usb_errors() -> None:
    def _wrap(func, label: str, allowed_errnos: tuple[int, ...]):
        def wrapped(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except usb.core.USBError as exc:
                if getattr(exc, "errno", None) in allowed_errnos:
                    print(f"[warn] {label}: {exc}; ignoring")
                    return None
                raise

        return wrapped

    usb.core.Device.detach_kernel_driver = _wrap(
        usb.core.Device.detach_kernel_driver,
        "usb.detach_kernel_driver",
        (13, 19),
    )
    usb.core.Device.set_configuration = _wrap(
        usb.core.Device.set_configuration,
        "usb.set_configuration",
        (19,),
    )
    usb.util.claim_interface = _wrap(
        usb.util.claim_interface,
        "usb.util.claim_interface",
        (19,),
    )
    usb.util.release_interface = _wrap(
        usb.util.release_interface,
        "usb.util.release_interface",
        (19,),
    )
